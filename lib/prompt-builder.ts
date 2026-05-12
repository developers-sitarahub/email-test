interface BrandContext {
  brandName: string;
  industry?: string;
  companyDescription?: string;
  targetAudience?: string;
  tone?: string;
  primaryGoal?: string;
  defaultCtaText?: string;
}

interface PromptOptions {
  brandContext?: BrandContext;
  campaignInstructions: string;
  recipientData: any;
  include: {
    headerImage?: boolean;
    cta?: boolean;
    signature?: boolean;
  };
  config: {
    ctaText?: string;
    ctaLink?: string;
    signature?: string;
  };
}

export function buildEmailPrompt({
  brandContext,
  campaignInstructions,
  recipientData,
  include,
  config,
}: PromptOptions) {
  const brandSection = brandContext
    ? `
### BRAND CONTEXT
Brand Name: ${brandContext.brandName}
${brandContext.industry ? `Industry: ${brandContext.industry}` : ""}
${brandContext.companyDescription ? `Company Description: ${brandContext.companyDescription}` : ""}
${brandContext.targetAudience ? `Target Audience: ${brandContext.targetAudience}` : ""}
${brandContext.tone ? `Preferred Tone: ${brandContext.tone}` : ""}
${brandContext.primaryGoal ? `Primary Goal: ${brandContext.primaryGoal}` : ""}
${brandContext.defaultCtaText ? `Default CTA: ${brandContext.defaultCtaText}` : ""}
`
    : "";

  return `
You are a world-class AI email strategist specializing in hyper-personalization.
Your goal is to generate unique, high-converting emails based on a user strategy and raw recipient data.

${brandSection}

### CAMPAIGN OBJECTIVE
"${campaignInstructions}"

### GUIDELINES
1. **SELF-DRIVEN DISCOVERY**: Analyze the keys and values in the JSON for each recipient. Identify the most interesting data points and weave them into the narrative automatically.
2. **NO PLACEHOLDERS**: Do not use generic phrases like "your work". Use the actual data from the fields.
3. **TONE**: Maintain the spirit of the ${brandContext?.tone ? "Preferred Tone" : "User Strategy"} while sounding like a real person.
4. **STRUCTURE**: Respect these UI settings:
   - Header Image: ${include?.headerImage ? "Include a relevant image block" : "Do NOT include image blocks"}
   - CTA: ${include?.cta ? `Include a CTA button (Text: "${config?.ctaText || brandContext?.defaultCtaText}", Link: "${config?.ctaLink}")` : "Do NOT include CTA blocks"}
   - Signature: ${include?.signature ? `Include a signature block (Details: "${config?.signature}")` : "Do NOT include signature blocks"}
5. **SPACING & PARAGRAPHS**: Use multiple paragraphs with double-line spacing (\\n\\n) for readability.

### RECIPIENT DATA
${JSON.stringify(recipientData, null, 2)}

### OUTPUT FORMAT
You MUST output ONLY a valid JSON object. No markdown. No intro/outro.
{
  "subject": "Compelling, data-driven subject line",
  "blocks": [
    { "type": "text | image | cta | signature", "content": { "text": "...", "url": "...", "link": "..." } }
  ]
}`;
}
