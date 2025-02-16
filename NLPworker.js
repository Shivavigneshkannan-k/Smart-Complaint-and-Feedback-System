// before  running it install,
// npm install @google/generative-ai
// then set up export GEMINI_API_KEY = "api_key_commes_here"

import { GoogleGenerativeAI } from "@google/generative-ai";

class NLPWork {
  constructor(modelName = "gemini-1.5-flash") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async find_category(description) {
    try {
      this.prompt = "You are given with a description of a complaint that was raised on a college, your task is to identify that this complaint comes under which category among the provided. Description: " + description + " Categories: Water Problem, Electricity, Mess, Other. Note: Return the output in the given format such that it contains, Format: Category : category_name";
      const result = await this.model.generateContent(this.prompt);
      return result.response.text();
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes("network")) {
        return "Network Error";
      }
      console.error("Error generating content:", error);
      throw error;
    }
  }

  async combine_complaint(descriptions) {
    try {
        all_complaints = "";
        descriptions.forEach(element => {
            all_complaints += element;
        });
        this.prompt = "You are given a group of complaint under same category that was raised on a college, your task is to group all the complaints and give them as a single complaint. Description: " + all_complaints + " .Note: Return the output in the given format such that it contains all important detials and give them in 9-10 lines as maximum, Format: Complaint : // here it comes";
        const result = await this.model.generateContent(this.prompt);
        return result.response.text();
    } catch (error) {
        if (error.code === 'ECONNABORTED' || error.message.includes("network")) {
            return "Network Error";
        }
        console.error("Error generating content:", error);
        throw error;
    }
  }

}

export default NLPWork;
