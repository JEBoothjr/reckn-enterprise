const { evaluate } = require("./index");

const { computeDecision } = require("./engine.js")

/**
 * Example: Hiring Screening
 */
async function main() {
  const config = {
    useCase: "hiring_screening",

    criteria: [
    {
      id: "engineering_leadership",
      name: "Engineering Leadership",
      description: "3+ years managing managers and multiple engineering teams, with demonstrated ability to drive execution, morale, and technical excellence",
      weight: 0.25,
    },
    {
      id: "technical_architecture",
      name: "Technical Architecture Expertise",
      description: "Deep expertise in backend system design or frontend component architecture, with hands-on technical credibility",
      weight: 0.20,
    },
    {
      id: "team_building",
      name: "Team Building & Scaling",
      description: "Proven track record of building, scaling, and developing high-performing engineering teams",
      weight: 0.18,
    },
    {
      id: "saas_experience",
      name: "SaaS Environment Experience",
      description: "Experience in SaaS, hyper-growth, or high-velocity tech environments",
      weight: 0.12,
    },
    {
      id: "operational_excellence",
      name: "Operational Excellence",
      description: "Strong operational skills including incident management, driving resolution, and implementing process improvements",
      weight: 0.10,
    },
    {
      id: "stakeholder_management",
      name: "Communication & Stakeholder Management",
      description: "Excellent cross-functional collaboration with Product, Design, and executive stakeholders",
      weight: 0.08,
    },
    {
      id: "engineering_experience",
      name: "Engineering Experience",
      description: "10+ years of hands-on engineering experience as a foundation for technical leadership",
      weight: 0.07,
    },
  ],

    anchors: {
      probability: {
        0.1: "Almost certainly meets criterion",
        0.2: "Very likely meets criterion",
        0.5: "Likely meets criterion",
        1: "Uncertain / mixed signals",
        3: "Likely does not meet criterion",
        6: "Very likely does not meet criterion",
        10: "Almost certainly does not meet criterion",
      },
      impact: {
        1: "Nice to have, minimal impact if missing",
        3: "Useful, some impact if missing",
        7: "Important, notable impact if missing",
        15: "Very important, significant impact if missing",
        40: "Critical, severe impact if missing",
        100: "Essential, role fails without this",
      },
      frequency: {
        0.5: "Rarely (few times per year)",
        1: "Occasionally (monthly)",
        2: "Regularly (weekly)",
        3: "Frequently (multiple times per week)",
        6: "Very frequently (daily)",
        10: "Constantly (core to every task)",
      },
      confidence: {
        0.07: "Explicit, unambiguous evidence",
        0.14: "Strong evidence with minor inference",
        0.21: "Good evidence, some gaps",
        0.28: "Partial evidence, notable inference",
        0.35: "Limited evidence, significant inference",
        0.42: "Minimal evidence, mostly inference",
      },
    },

    roleDocumentName: "Senior Director of Engineering",
    roleDocument: `
At ClickUp, we’re not just building software. We’re architecting the future of work! In a world overwhelmed by work sprawl, we saw a better way. That’s why we created the first truly converged AI workspace, unifying tasks, docs, chat, calendar, and enterprise search, all supercharged by context-driven AI, empowering millions of teams to break free from silos, reclaim their time, and unlock new levels of productivity. At ClickUp, you’ll have the opportunity to learn, use, and pioneer AI in ways that shape not only our product, but the future of work itself. Join us and be part of a bold, innovative team that’s redefining what’s possible! 🚀

ClickUp is seeking a Senior Director of Engineering to lead and inspire multiple engineering teams in building the future of productivity. In this high-impact leadership role, you’ll drive the execution, morale, hiring, and technical excellence of 2+ teams, balancing the velocity of feature development with the highest standards of quality and performance. You’ll play a pivotal role in shaping our engineering culture, scaling our technology, and delivering innovative solutions that empower millions of users worldwide.



The ideal candidate is a hands-on technical leader with deep expertise in backend system design or frontend component architecture, operational rigor, and a passion for developing high-performing teams. You thrive in fast-paced environments, excel at driving progress on both large-scale projects and the small tasks that keep teams moving, and know how to keep teams motivated even when the bar is high. If you’re energized by complex challenges and want to make a lasting impact at a hyper-growth, AI-driven SaaS company, this is your opportunity to lead at scale.



The Role:
Lead, mentor, and manage 2+ engineering teams, ensuring high morale, strong execution, and technical excellence

Drive the velocity of feature development while maintaining quality, reliability, and performance in your ownership area

Oversee hiring, onboarding, and professional development for your teams

Balance operational urgency handling incidents and driving resolution with long-term technical strategy

Foster a culture of accountability, continuous improvement, and innovation

Collaborate cross-functionally with Product, Design, and other stakeholders to deliver on company priorities

Identify and remove obstacles to team success, ensuring healthy, autonomous teams that require minimal oversight

Champion ClickUp’s mission to unify productivity tools and shape the future of work

Qualifications:
10+ years of engineering experience, with 3+ years in engineering leadership roles (managing managers and multiple teams)

Proven track record of building and scaling high-performing engineering teams in a SaaS or tech environment

Deep technical expertise in backend system design or frontend component architecture

Strong operational skills—able to drive incidents to resolution and implement process improvements

Demonstrated ability to motivate teams in high-velocity, high-expectation environments

Experience balancing feature delivery with quality, performance, and reliability

Excellent communication, collaboration, and stakeholder management skills

Bachelor’s or Master’s degree in Computer Science, Engineering, or related field (or equivalent experience)

Why Join ClickUp?
Shape the future of work at a hyper-growth, pre-IPO SaaS leader

Lead teams building products used by millions globally

Thrive in a culture of innovation, autonomy, and impact

Work alongside top talent in a collaborative, AI-driven environment

Competitive compensation, equity, and world-class benefits

Ready to drive engineering excellence and help build the world’s only all-in-one productivity platform? Apply now and make your mark at ClickUp.
    `,

    candidateDocumentName: "james_booth.pdf",
    candidateDocument: `
James Booth
CTO @ATTUNE | Engineering Leader | Founding Engineer | Mentor
| Fractional CTO
Nashville Metropolitan Area
Summary
I’m a software engineering leader with over 25 years of experience
leading teams and developing innovative solutions in both corporate
and multiple startup environments. I have a thorough understanding
of the software development lifecycle and throughout my career I’ve
been a part of, worked closely with, or managed teams on the front-
end, backend, QA, Ops and Security. A believer in a dev-ops culture,
I’m always looking for ways to help teams work more efficiently.
Experience
ATTUNE
Chief Technology Officer
January 2024 - Present (2 years 1 month)
- Provided strategic technology leadership and hands-on technical direction to
drive the growth and scalability of a multi-tenant banking platform.
- Led a full rebuild of the core product, modernizing architecture, security
model, PostgreSQL data layer, and cloud infrastructure to support future
growth and regulatory requirements.
- Owned end-to-end DevOps strategy, including AWS infrastructure, CI/CD
pipelines, environment isolation, and production reliability.
- Designed and implemented the core PostgreSQL architecture, including
schema design, data integrity, and scalability considerations for regulated
financial workloads.
- Managed and scaled global engineering teams across India and LATAM,
establishing engineering standards, delivery processes, and operational rigor.
- Oversaw third-party vendors and platform integrations, ensuring reliability,
security alignment, and contractual accountability.
- Led SOC compliance efforts, partnering with security and compliance
stakeholders to support audit readiness and operational controls.
- Acted as the primary technical authority across architecture, security,
DevOps, and data, partnering closely with the CEO on product and technical
strategy.
Page 1 of 6
- Delivered a new production platform with customer migration and go-live
underway.
MentorCruise
Software Engineering Mentor - "Top Mentor"
April 2021 - Present (4 years 10 months)
Focusing on software engineering, I've mentored more than 60 individuals
since I began on MentorCruise with durations ranging from 1 month to more
than 2 years. I've mentored a variety of individuals including engineering
leaders, CEO's, career changers, new managers, engineers and software
architects, meeting with them on a regular basis. I'm in the top 2% of mentors
on the platform and have maintained a perfect 5-star rating.
First Round Capital
Fast Track Mentor
September 2022 - January 2024 (1 year 5 months)
Tesorio
Director of Infrastructure and Platform
July 2022 - December 2023 (1 year 6 months)
- Led fully remote Infrastructure, Platform, and Integrations teams, establishing
consistent agile delivery practices and conducting regular 1:1s focused on
mentorship and career growth.
- Defined and documented core engineering processes, including incident
response, postmortems, and change management, improving operational
consistency and reliability.
- Drove continuous improvement across engineering and cross-functional
workflows by identifying inefficiencies and implementing automation.
- Planned and executed a full architecture migration from Heroku to
Kubernetes on AWS (EKS), managing multiple AWS accounts, environments,
and PostgreSQL databases.
- Owned infrastructure and platform strategy across cloud environments,
ensuring scalability, reliability, and operational excellence.
- Took on additional responsibilities for security and compliance, ensuring the
architecture met organizational and regulatory requirements.
FloQast
7 years 10 months
Head of DevOps | Principal Software Architect
October 2016 - July 2022 (5 years 10 months)
Page 2 of 6
Using Terraform and AWS, I architected and managed the development of all
infrastructure across several AWS accounts and our Jenkins-based continuous
delivery pipelines for all of our services including monoliths, several micro-
services, lambdas and more. I led the design and implementation of tools
for Engineers to quickly create and deploy services using only Slack and
GitHub, allowing them to focus on product development. I defined additional
policies and procedures to continue to streamline Engineering architecture
as the company scales, including documentation, an RFC process and risk
management.
In addition to my Principal Software Architect role, I assumed an interim
role of Head of DevOps. In this role, I've outline the career path strategy for
DevOps Engineers and defined and documented the processes for agile
ceremonies as well as for evaluating and hiring DevOps Engineer candidates.
As DevOps leadership, I scaled the DevOps team to support more than
a dozen Engineering teams and following a DevOps strategy, worked to
orchestrate a shift left to facilitate continuous improvements in deploying,
monitoring, debugging and maintaining services across all Engineering teams
and more than 20 AWS cloud environments. I also planned and executed the
expansion of the infrastructure into EMEA.
Having scaled the DevOps team and laid the foundation for its continued
growth, I promoted a manager from within the team and resumed my full
time role as Principal Software Architect with the focus on ensuring that our
architecture scales alongside the company's continued growth and success.
Technical Lead
October 2014 - October 2016 (2 years 1 month)
As employee #1 at FloQast, I instituted agile and test-driven development into
the team philosophy. I led the team in rebuilding the frontend in React and
developed scripts to facilitate that development. In addition to the frontend,
I led the team in refactoring the Node.js backend code by creating and
implementing the guidelines for redesigning endpoints, refactoring/rewriting
the current logic with testing and coverage, creating MongoDB migration
scripts and multiple nightly crons. I worked daily with the team to design
and implement new features. I planned, developed and provisioned the
infrastructure migration from Heroku to AWS, utilizing EC2, S3, Elasticsearch,
Lambda functions, SNS, SQS, Elastic Beanstalk and web sockets to expand
the current capabilities of our application. I also set up and managed our
deployment infrastructure using Jenkins.
Page 3 of 6
Incroud
Senior Software Engineer
May 2014 - October 2014 (6 months)
Santa Monica, Ca
In this short-lived startup, I worked to build out a commerce, media and peer-
to-peer platform using Angular, Node.js, Cassandra and Azure.
M-GO: Movies & TV Everywhere!
4 years 7 months
Engineering Manager : Front-End Team
October 2013 - May 2014 (8 months)
Culver City, CA
As Manager of the front-end team, I led day-to-day development as scrum
master and represented the front-end team in daily executive meetings to
maintain focus on deliverables. I oversaw the front-end development of the
new M-GO website and was involved in the interview and hiring process of
new team members.
Technical Lead : Front-End Development
November 2009 - October 2013 (4 years)
Culver City, CA
I was a founding member of an incubator team within Technicolor that became
MGO, a joint venture with DreamWorks that was acquired by Fandango and
rebranded as FandangoNow and now owned by Vudu. I led teams in the
architecture and development of Flash and Javascript applications for various
devices including TV, Blu-ray, web and mobile. I coordinated with other teams
to ensure that development and deployments went smoothly and mentored
junior developers in application design as well as development and unit
testing. I led day-to-day development as scrum master and represented the
front-end team in daily executive meetings to maintain focus on deliverables.
MySpace
Web Developer
February 2008 - November 2009 (1 year 10 months)
Beverly Hills, CA
I worked with developers and contractors to develop and unit-test ui
components for various areas of the MySpace video and music web sites.
I worked closely with product managers and designers to create appealing
applications and simplified online contest creation by developing a dynamic
and reusable ui architecture.
Page 4 of 6
Tracermedia
Senior Developer
March 2006 - February 2008 (2 years)
Columbus, OH
I worked with developers and ui designers to create dynamic applications
for various clients. I created an online video editor and devised innovative
solutions for streaming content. I also traveled regularly to client locations to
ensure the quality of product development and deployment.
Hondros Learning
Developer
March 2003 - March 2006 (3 years 1 month)
Westerville, OH
I led the development and architecture of the online learning portal for Real
Estate education. I worked closely with the marketing team to strategize and
develop a new e-learning solutions for the Real Estate market which required
communicating directly with LMS vendors to ensure proper integration of their
software. I also worked closely with instructors and instructional designers to
develop engaging courses for students.
Tracermedia
Developer
March 2002 - March 2003 (1 year 1 month)
Columbus, OH
I was contracted to create TechKnowledge, an interactive elementary school
learning application forSRA/McGraw Hill. While there, I also created various
tooling to enable more efficient content development.
ManaVision
Developer
January 2002 - March 2002 (3 months)
Dayton, OH
Using Flash and Director, I created interactive web and cdrom applications and
3D animations for clients such as Iams, NCR and the National Aviation Hall of
Fame.
Lucent Technologies
Multimedia Developer
March 1998 - March 2002 (4 years 1 month)
Columbus, OH
Page 5 of 6
I architected a platform for web and cdrom-based training as well as created
graphics for the course content.
Education
AS, Computer Animation/Multimedia · (1995 - 1997)
    `,
  };

  console.log("Evaluating candidate...\n");

  try {
    const result = await evaluate(config);

    console.log("=== EVALUATION RESULT ===\n");
    console.log(JSON.stringify(result, null, 2));

    const decision = computeDecision(result.criteria);

    console.log("=== DECISION RESULT ===\n");
    console.log(JSON.stringify(decision, null, 2));

    if (!result.validation.valid) {
      console.log("\n=== VALIDATION ERRORS ===");
      result.validation.errors.forEach((e) => console.log(`- ${e}`));
    }
  } catch (error) {
    console.error("Evaluation failed:", error);
  }
}

main();
