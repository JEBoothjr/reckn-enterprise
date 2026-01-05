const { generateCriteria } = require("./criteria-generator");

/**
 * Example: Generate criteria from a job description
 */
async function main() {
  const config = {
    maxCriteria: 7,
    jobDescription: `
At ClickUp, we're not just building software. We're architecting the future of work! In a world overwhelmed by work sprawl, we saw a better way. That's why we created the first truly converged AI workspace, unifying tasks, docs, chat, calendar, and enterprise search, all supercharged by context-driven AI, empowering millions of teams to break free from silos, reclaim their time, and unlock new levels of productivity. At ClickUp, you'll have the opportunity to learn, use, and pioneer AI in ways that shape not only our product, but the future of work itself. Join us and be part of a bold, innovative team that's redefining what's possible! 🚀

ClickUp is seeking a Senior Director of Engineering to lead and inspire multiple engineering teams in building the future of productivity. In this high-impact leadership role, you'll drive the execution, morale, hiring, and technical excellence of 2+ teams, balancing the velocity of feature development with the highest standards of quality and performance. You'll play a pivotal role in shaping our engineering culture, scaling our technology, and delivering innovative solutions that empower millions of users worldwide.

The ideal candidate is a hands-on technical leader with deep expertise in backend system design or frontend component architecture, operational rigor, and a passion for developing high-performing teams. You thrive in fast-paced environments, excel at driving progress on both large-scale projects and the small tasks that keep teams moving, and know how to keep teams motivated even when the bar is high. If you're energized by complex challenges and want to make a lasting impact at a hyper-growth, AI-driven SaaS company, this is your opportunity to lead at scale.

The Role:
* Lead, mentor, and manage 2+ engineering teams, ensuring high morale, strong execution, and technical excellence
* Drive the velocity of feature development while maintaining quality, reliability, and performance in your ownership area
* Oversee hiring, onboarding, and professional development for your teams
* Balance operational urgency handling incidents and driving resolution with long-term technical strategy
* Foster a culture of accountability, continuous improvement, and innovation
* Collaborate cross-functionally with Product, Design, and other stakeholders to deliver on company priorities
* Identify and remove obstacles to team success, ensuring healthy, autonomous teams that require minimal oversight
* Champion ClickUp's mission to unify productivity tools and shape the future of work

Qualifications:
* 10+ years of engineering experience, with 3+ years in engineering leadership roles (managing managers and multiple teams)
* Proven track record of building and scaling high-performing engineering teams in a SaaS or tech environment
* Deep technical expertise in backend system design or frontend component architecture
* Strong operational skills—able to drive incidents to resolution and implement process improvements
* Demonstrated ability to motivate teams in high-velocity, high-expectation environments
* Experience balancing feature delivery with quality, performance, and reliability
* Excellent communication, collaboration, and stakeholder management skills
* Bachelor's or Master's degree in Computer Science, Engineering, or related field (or equivalent experience)

Why Join ClickUp?
* Shape the future of work at a hyper-growth, pre-IPO SaaS leader
* Lead teams building products used by millions globally
* Thrive in a culture of innovation, autonomy, and impact
* Work alongside top talent in a collaborative, AI-driven environment
* Competitive compensation, equity, and world-class benefits

Ready to drive engineering excellence and help build the world's only all-in-one productivity platform? Apply now and make your mark at ClickUp.
    `,
  };

  console.log("Generating criteria from job description...\n");

  try {
    const result = await generateCriteria(config);

    console.log("=== GENERATED CRITERIA ===\n");
    console.log(JSON.stringify(result, null, 2));

    if (!result.validation.valid) {
      console.log("\n=== VALIDATION ERRORS ===");
      result.validation.errors.forEach((e) => console.log(`- ${e}`));
    }

    // Show summary
    console.log("\n=== SUMMARY ===");
    console.log(`Generated ${result.criteria.length} criteria:`);
    result.criteria.forEach((c) => {
      console.log(`  - ${c.name} (${(c.weight * 100).toFixed(0)}%)`);
    });
    console.log(`\nReasoning: ${result.reasoning}`);
  } catch (error) {
    console.error("Generation failed:", error);
  }
}

main();
