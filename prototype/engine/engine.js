import jStat from 'jstat';

export const VERSION = 'v0.7.0';

const PROBABILITY_RANGE = [0.1, 0.2, 0.5, 1, 3, 6, 10]
const IMPACT_RANGE = [1, 3, 7, 15, 40, 100];
const FREQUENCY_RANGE = [0.5, 1, 2, 3, 6, 10];
const CONFIDENCE_RANGE = [0.07, 0.14, 0.21, 0.28, 0.35, 0.42];
const ZSCORE = 0.95;
// const ZSCORE = 0.98;

export function calculatePert({ optimistic, mostLikely, pessimistic }) {
    const PERT = (optimistic + (4 * mostLikely) + pessimistic) / 6;

    return PERT;
}

export function calculateStatisticalPert({ optimistic, pessimistic, confidence }) {
    const STATISTICAL_PERT = (pessimistic - optimistic) * confidence;

    return STATISTICAL_PERT;
}

export function calculateNormInv(pert, statisticalPert, zscore) {
    const NORMINV = jStat.normal.inv(zscore, pert, statisticalPert);

    return NORMINV;
}

export function calculateRisk(probability, impact, frequency) {
    const RISK = (probability * impact * frequency);

    return RISK;
}

export function calculateWeightedScore(score, weight) {
    const WEIGHTED_SCORE = (score * weight);

    return WEIGHTED_SCORE;
}

export function calculateFactorScore(factor) {
    const {
        weight,
        probability,
        impact,
        frequency
    } = factor;

    const PROBABILITY_PERT = calculatePert(probability);
    const IMPACT_PERT = calculatePert(impact);
    const FREQUENCY_PERT = calculatePert(frequency);

    const PROBABILITY_STATISTICAL_PERT = calculateStatisticalPert(probability);
    const IMPACT_STATISTICAL_PERT = calculateStatisticalPert(impact);
    const FREQUENCY_STATISTICAL_PERT = calculateStatisticalPert(frequency);

    const PROBABILITY_NORMINV = calculateNormInv(PROBABILITY_PERT, PROBABILITY_STATISTICAL_PERT, ZSCORE);
    const IMPACT_NORMINV = calculateNormInv(IMPACT_PERT, IMPACT_STATISTICAL_PERT, ZSCORE);
    const FREQUENCY_NORMINV = calculateNormInv(FREQUENCY_PERT, FREQUENCY_STATISTICAL_PERT, ZSCORE);

    const RISK = calculateRisk(PROBABILITY_NORMINV, IMPACT_NORMINV, FREQUENCY_NORMINV);

    const RAW_SCORE = RISK;
    const WEIGHTED_SCORE = calculateWeightedScore(RISK, weight);

    return {
        factor: factor.id,
        weight: weight,
        raw_score: RAW_SCORE,
        weighted_score: WEIGHTED_SCORE,
        probability: PROBABILITY_NORMINV,
        impact: IMPACT_NORMINV,
        frequency: FREQUENCY_NORMINV
    };
}

// This probably won't work as it emphasizes the risks
function calculatePowerMean2Score(rawScores, weights) {
    if (rawScores.length !== weights.length) {
        throw new Error("Arrays must be the same length");
    }

    let numerator = 0;
    let weightSum = 0;

    for (let i = 0; i < rawScores.length; i++) {
        const score = rawScores[i];
        const weight = weights[i];

        numerator += weight * Math.pow(score, 2);
        weightSum += weight;
    }

    if (weightSum === 0) {
        throw new Error("Sum of weights must be greater than 0");
    }

    return Math.sqrt(numerator / weightSum);
}

// This doesn't work since as more criteria are added, the value goes down.
// export function calculateWeightedAverageScore(weightedScores) {
//     const FINAL_SCORE_SUM = weightedScores.reduce((sum, score) => sum + score, 0);
//     const FINAL_SCORE = FINAL_SCORE_SUM / weightedScores.length;

//     return FINAL_SCORE;
// }

// function calculateScoreRatio(weightedScores) {
//     // const MAX_WEIGHTED_SCORE = 34560.24088; // Actual limit, but unrealistic in that a user would likely never hit that which cause everything to skew low.
//     const MAX_WEIGHTED_SCORE = 15000; // Real world limit
//     const WEIGHTED_SCORE_SUM = weightedScores.reduce((sum, score) => sum + score, 0);
//     const FINAL_SCORE = WEIGHTED_SCORE_SUM / MAX_WEIGHTED_SCORE;

//     return FINAL_SCORE;
// }

export function calculateFinalScore(rawScores, weightedScores, weights) {
    // const FINAL_SCORE = calculateWeightedAverageScore(weightedScores);
    // const FINAL_SCORE = calculatePowerMean2Score(rawScores, weights);
    const FINAL_SCORE = weightedScores.reduce((sum, score) => sum + score, 0);

    return FINAL_SCORE;
}

// Tolerance defaults to 1
// It will expand the bands
// A YC + LinkedIn Profile could be a 1.5 due to incompleteness
function getScoreObject(rawScore, numFactors, config) {
    const tolerance = config?.tolerance ?? 1;
    const scale = numFactors;

    const bounds = {
        1: [0, 0.35 * scale * tolerance],
        2: [0.35 * scale * tolerance, 3.5 * scale * Math.pow(tolerance, 2)],
        3: [3.5 * scale * Math.pow(tolerance, 2), 75 * scale * Math.pow(tolerance, 3)],
        4: [75 * scale * Math.pow(tolerance, 3), 2300 * scale * Math.pow(tolerance, 4)],
        5: [2300 * scale * Math.pow(tolerance, 4), Infinity]
    };

    for (let band = 1; band <= 5; band++) {
        const [min, max] = bounds[band];
        if (rawScore >= min && rawScore <= max) {
            const logMin = Math.log(min || 0.001);
            const logMax = Math.log(max);
            const logScore = Math.log(rawScore || 0.001);
            const position = (logScore - logMin) / (logMax - logMin);

            return {
                value: rawScore,
                band: band,
                position: +position.toFixed(2),
                tolerance: tolerance
            };
        }
    }

    return null;
}

export function computeDecision(factorsSet, config) {
    const results = factorsSet.map(factor =>
        calculateFactorScore(factor)
    );

    const weightedScores = results.map((x) => x.weighted_score);
    const rawScores = results.map((x) => x.raw_score);
    const weights = factorsSet.map((x) => x.weight);

    const finalScore = calculateFinalScore(rawScores, weightedScores, weights);

    return {
        engine: VERSION,
        score: getScoreObject(finalScore, factorsSet.length, config),
        data: results
    };
}