import { toast } from "sonner";

export interface ExtractedProjectData {
  clientName: string;
  company: string;
  email: string;
  projectTitle: string;
  budget: number;
  timelineDays: number;
  milestones: { id: string; title: string; completed: boolean }[];
  summary: string;
}

export class JarvisEngine {
  /**
   * Handles casual greetings and conversational queries naturally without robot-speak.
   */
  static handleCasualMessage(text: string): string | null {
    const lower = text.toLowerCase().trim();
    
    if (["hi", "hello", "hey", "sup", "yo", "good morning", "good evening"].includes(lower)) {
      return "Hey there! Jarvis is online and ready. What are we building or managing today?";
    }

    if (lower.includes("how are you") || lower.includes("who are you")) {
      return "I'm Jarvis, your BPO Nexus CTO and autonomous project architect. All systems are online—how can I help you scale your workspace?";
    }

    return null; // Not a casual message, proceed with standard AI/autonomous logic
  }

  /**
   * Evaluates if a raw text brief contains enough information to autonomously build a project.
   */
  static analyzeBrief(text: string): { ready: boolean; missingFields: string[] } {
    const lower = text.toLowerCase();
    const missingFields: string[] = [];

    if (!lower.includes("budget") && !lower.includes("$") && !lower.includes("usd")) {
      missingFields.push("Budget / Pricing");
    }
    if (!lower.includes("timeline") && !lower.includes("day") && !lower.includes("week") && !lower.includes("month")) {
      missingFields.push("Timeline / Deadline");
    }
    if (!lower.includes("requirement") && !lower.includes("build") && !lower.includes("create") && !lower.includes("app")) {
      missingFields.push("Core Scope / Requirements");
    }

    return {
      ready: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Autonomously extracts parameters from text and formats a production-ready payload.
   */
  static parseBriefToPayload(text: string): ExtractedProjectData {
    const lines = text.split("\n").filter(Boolean);
    const title = lines[0]?.slice(0, 50) || "Freelancer Autonomous Deployment";
    
    const budgetMatch = text.match(/\$([0-9,]+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ""), 10) : 5000;

    return {
      clientName: "Freelancer Client",
      company: "Acme Corp",
      email: "client@freelancer-partner.io",
      projectTitle: title,
      budget,
      timelineDays: 30,
      milestones: [
        { id: `m_${Date.now()}_1`, title: "Architecture & Schema Setup", completed: false },
        { id: `m_${Date.now()}_2`, title: "Core Feature Development", completed: false },
        { id: `m_${Date.now()}_3`, title: "QA Testing & Production Delivery", completed: false },
      ],
      summary: text.slice(0, 200) + "...",
    };
  }

  /**
   * Executes the autonomous database provisioning across stores.
   */
  static executeAutonomousProvisioning(
    payload: ExtractedProjectData,
    stores: {
      addClient: (client: any) => void;
      addProject: (project: any) => void;
    }
  ) {
    const clientId = `client_${Date.now()}`;
    const projectId = `proj_${Date.now()}`;

    stores.addClient({
      id: clientId,
      name: payload.clientName,
      company: payload.company,
      email: payload.email,
      country: "United States",
      countryCode: "US",
      freelancerUsername: "FreelancerVIP",
      totalProjects: 1,
      totalRevenue: payload.budget,
      rating: 5.0,
      status: "Active",
    });

    stores.addProject({
      id: projectId,
      title: payload.projectTitle,
      client: payload.clientName,
      status: "In Progress",
      budget: payload.budget,
      deadline: new Date(Date.now() + payload.timelineDays * 24 * 60 * 60 * 1000).toISOString(),
      milestones: payload.milestones,
    });

    toast.success("🤖 Jarvis Autonomous Execution Complete!", {
      description: `Provisioned project "${payload.projectTitle}" ($${payload.budget.toLocaleString()}) with ${payload.milestones.length} milestones.`,
      duration: 5000,
    });
  }
}