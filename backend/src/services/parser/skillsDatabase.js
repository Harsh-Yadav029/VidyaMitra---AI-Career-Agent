// ============================================================
//  VidyaMitra — services/parser/skillsDatabase.js
//  Master list of skills used for extraction from resume text
//  Organized by category for richer output
// ============================================================

const SKILLS_DATABASE = {
  // ── Programming Languages ──────────────────────────────────
  languages: [
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#",
    "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R",
    "MATLAB", "Perl", "Bash", "Shell", "PowerShell", "Dart", "Lua",
    "Haskell", "Elixir", "Clojure", "F#", "COBOL", "Fortran", "Assembly",
    "Solidity", "Move", "Groovy", "Julia"
  ],

  // ── Frontend ───────────────────────────────────────────────
  frontend: [
    "React", "React.js", "Next.js", "Vue", "Vue.js", "Nuxt.js",
    "Angular", "AngularJS", "Svelte", "SvelteKit", "Ember.js",
    "HTML", "HTML5", "CSS", "CSS3", "SASS", "SCSS", "Less",
    "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Ant Design",
    "jQuery", "Redux", "Zustand", "Recoil", "MobX", "Context API",
    "Webpack", "Vite", "Parcel", "Rollup", "Babel", "ESLint", "Prettier",
    "Storybook", "Figma", "Framer Motion", "Three.js", "D3.js",
    "React Native", "Flutter", "Ionic", "Expo"
  ],

  // ── Backend ────────────────────────────────────────────────
  backend: [
    "Node.js", "Express", "Express.js", "FastAPI", "Flask", "Django",
    "Spring Boot", "Spring", "Laravel", "Ruby on Rails", "Rails",
    "ASP.NET", ".NET", "NestJS", "Hapi.js", "Koa.js", "Fastify",
    "GraphQL", "REST", "RESTful", "gRPC", "WebSocket", "Socket.io",
    "Microservices", "Serverless", "tRPC"
  ],

  // ── Databases ──────────────────────────────────────────────
  databases: [
    "MongoDB", "MySQL", "PostgreSQL", "SQLite", "Oracle", "SQL Server",
    "MariaDB", "Cassandra", "DynamoDB", "Redis", "Elasticsearch",
    "Firebase", "Firestore", "Supabase", "PlanetScale", "CockroachDB",
    "Neo4j", "InfluxDB", "Pinecone", "ChromaDB", "FAISS", "Weaviate",
    "SQL", "NoSQL", "PL/SQL", "T-SQL"
  ],

  // ── Cloud & DevOps ─────────────────────────────────────────
  devops: [
    "AWS", "Azure", "GCP", "Google Cloud", "Heroku", "Vercel", "Netlify",
    "Docker", "Kubernetes", "K8s", "Terraform", "Ansible", "Puppet", "Chef",
    "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
    "Nginx", "Apache", "Linux", "Ubuntu", "CentOS", "Debian",
    "CI/CD", "DevOps", "SRE", "Helm", "Prometheus", "Grafana",
    "Datadog", "New Relic", "Splunk", "ELK Stack", "Logstash", "Kibana"
  ],

  // ── AI / ML / Data ─────────────────────────────────────────
  ai_ml: [
    "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing",
    "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-learn",
    "Pandas", "NumPy", "Matplotlib", "Seaborn", "OpenCV", "Hugging Face",
    "LangChain", "OpenAI", "GPT", "BERT", "Transformers", "RAG",
    "Data Science", "Data Analysis", "Data Engineering",
    "Apache Spark", "Hadoop", "Airflow", "dbt", "Kafka",
    "Power BI", "Tableau", "Looker", "Jupyter", "Colab",
    "Reinforcement Learning", "MLOps", "Feature Engineering",
    "A/B Testing", "Statistics", "Linear Algebra"
  ],

  // ── Mobile ─────────────────────────────────────────────────
  mobile: [
    "Android", "iOS", "React Native", "Flutter", "Swift", "Kotlin",
    "Objective-C", "Xamarin", "Ionic", "Expo", "Xcode", "Android Studio"
  ],

  // ── Testing ────────────────────────────────────────────────
  testing: [
    "Jest", "Mocha", "Chai", "Jasmine", "Cypress", "Playwright",
    "Selenium", "Puppeteer", "JUnit", "TestNG", "pytest", "unittest",
    "React Testing Library", "Enzyme", "Vitest", "k6", "Postman",
    "Unit Testing", "Integration Testing", "E2E Testing", "TDD", "BDD"
  ],

  // ── Version Control & Tools ────────────────────────────────
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN",
    "Jira", "Confluence", "Notion", "Trello", "Asana", "Linear",
    "VS Code", "IntelliJ", "Eclipse", "Xcode", "Vim", "Emacs",
    "Postman", "Insomnia", "Swagger", "OpenAPI",
    "npm", "yarn", "pnpm", "pip", "Maven", "Gradle"
  ],

  // ── Soft Skills ────────────────────────────────────────────
  soft: [
    "Leadership", "Communication", "Teamwork", "Problem Solving",
    "Critical Thinking", "Time Management", "Agile", "Scrum", "Kanban",
    "Project Management", "Mentoring", "Code Review", "Technical Writing",
    "Public Speaking", "Collaboration", "Adaptability"
  ],
};

// ── Flat list for fast lookup ──────────────────────────────────
const ALL_SKILLS = Object.values(SKILLS_DATABASE).flat();

// ── Lookup map: lowercase → canonical name ─────────────────────
const SKILLS_MAP = new Map();
ALL_SKILLS.forEach((skill) => {
  SKILLS_MAP.set(skill.toLowerCase(), skill);
  // Also handle common abbreviations
});

module.exports = { SKILLS_DATABASE, ALL_SKILLS, SKILLS_MAP };
