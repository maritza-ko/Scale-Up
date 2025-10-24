const { GoogleGenAI, Type } = require("@google/genai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { storeCount } = req.body;

  if (typeof storeCount !== 'number') {
    return res.status(400).json({ error: 'Invalid storeCount provided' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
            You are an expert financial and HR analyst for a specialized South Korean fried chicken franchise.

            Business Model Context:
            - **Store Model**: Small, under 10 pyeong (~33 sqm), delivery-only outlets in low-cost 'C-level' back-alley locations.
            - **Product Process**: A central factory pre-processes chicken (3rd powdering, 1st fry). Stores only perform a final 2nd fry and add sauce/seasoning.
            - **Logistics (3PL)**: Extremely simplified model, similar to a parcel delivery service. The process is: pick up pre-packaged goods (processed chicken, boxes, service items) from the central factory, store them at a warehouse, and perform regular scheduled deliveries to individual stores. There is NO processing, sorting, or complex logistics at the 3PL facility.
            - **Side Menus**: Typical Korean side dishes like tteokbokki or jeon (savory pancakes).
            - **Control Center Roles**: The control center is the operational hub. Its roles evolve with the automation level:
                - **Level C/B**: The focus is on reactive support and supervision. Staff primarily handle remote Customer Service (CS), manage delivery platform listings, and provide remote technical support.
                - **Level A**: The model shifts to proactive, fully unmanned store support. Staff manage centralized washing/prep and remotely oversee opening/closing procedures, in addition to CS and tech support.
            
            **Staffing Analysis Context (for reference at 1,000 stores):**
            - This is the current, potentially inefficient, staffing model for a 1,000-store operation. Your primary task is to analyze this structure and propose a more efficient, optimized staffing model for the requested store count below.
            - **Total**: 82 staff
            - **Breakdown**:
              - **HQ**: 43 total (1 Director, 22 Corporate Support, 20 CS)
              - **Regional**: 5 Hub Managers
              - **Tech Support**: 9 specialists
              - **Patrol Staff**: 25 field staff (for Level B/A)

            Based on a franchise scale of ${storeCount} stores and the specific business model above, provide realistic, industry-average estimates for the financial parameters AND **propose an optimized, efficient number of central staff.**
            
            **CRITICAL INSTRUCTION: All text values in the final JSON, especially within the 'staffing_reasoning' and 'reasoning' objects, MUST be written in Korean.** The analysis must be presented in natural, professional Korean, suitable for a business report. For example, in 'staffing_reasoning', explain the logic behind your proposed numbers with specific data: "A레벨 자동화로 단순 CS 문의가 30% 감소하고, 원격 모니터링 시스템이 도입되어 기술지원 인력 1인당 관리 가능 매장 수가 50% 증가하므로 인력을 재조정했습니다." Avoid generic statements. For 'threePlRate', state "단순 보관/배송 모델은 복합 물류 대비 고정비가 40% 낮아 낮은 비율을 책정했습니다."

            Provide the output as a single, valid JSON object with the specified structure. Do not include any other text or markdown formatting.
            
            Parameter-specific instructions:
            - **centerStaffSalaries**: Reflect the complex and evolving roles within the control center. Provide appropriate monthly salaries in KRW.
            - **pnlInputs.procCost**: Reflect only the final 2nd fry and saucing process. Reference: one 18-liter can of cooking oil is used for 60 chickens. Factor in oil, sauces, and seasonings. **CRITICAL: The final value MUST NOT exceed 1,500 KRW.**
            - **pnlInputs.serviceCost**: Base this on the average cost of typical Korean side dishes.
            - **pnlInputs.avgRent**: CRITICAL: This must reflect the very low rent of a small (under 10 pyeong / 33sqm), delivery-only store in a non-prime, back-alley 'C-level' commercial area.
            - **pnlInputs.wageMultiplier**: Propose a realistic wage multiplier to apply to the legal minimum wage (10,030 KRW). This should create a competitive market wage. (e.g., 1.1 for 110%, 1.2 for 120%). This value is a multiplier, NOT the final wage.
            - **pnlInputs.threePlRate**: This must be a LOW percentage of COGS, reflecting the highly simplified, parcel-delivery-like logistics model described above.
        `;

    const schema = {
          type: Type.OBJECT,
          properties: {
            cogsDiscountTiers: {
              type: Type.ARRAY,
              description: "Discount tiers based on number of stores.",
              items: {
                type: Type.OBJECT,
                properties: {
                  threshold: { type: Type.NUMBER, description: "Number of stores to trigger discount." },
                  discount: { type: Type.NUMBER, description: "Discount rate as a decimal (e.g., 0.02 for 2%)." }
                },
                required: ["threshold", "discount"]
              }
            },
            capexDiscountTiers: {
              type: Type.ARRAY,
              description: "Equipment CAPEX discount tiers based on number of stores due to purchasing power.",
              items: {
                type: Type.OBJECT,
                properties: {
                  threshold: { type: Type.NUMBER, description: "Number of stores to trigger discount." },
                  discount: { type: Type.NUMBER, description: "Discount rate as a decimal (e.g., 0.02 for 2%)." }
                },
                required: ["threshold", "discount"]
              }
            },
            centerStaffSalaries: {
              type: Type.OBJECT,
              description: "Average monthly salaries in KRW.",
              properties: {
                head: { type: Type.NUMBER, description: "Salary for an HQ Director or Regional Hub Manager." },
                corporate: { type: Type.NUMBER, description: "Salary for a corporate office worker (finance, legal, etc.)." },
                cs: { type: Type.NUMBER, description: "Salary for a Customer Service representative." },
                techSupport: { type: Type.NUMBER, description: "Salary for a technical support/equipment maintenance specialist." }
              },
              required: ["head", "corporate", "cs", "techSupport"]
            },
            staffing: {
              type: Type.OBJECT,
              description: "Optimal number of central staff based on store count and operational complexity.",
              properties: {
                corporate: { type: Type.NUMBER, description: "Number of general corporate/back-office staff (finance, marketing, etc.)." },
                cs: { type: Type.NUMBER, description: "Number of Customer Service representatives." },
                techSupport: { type: Type.NUMBER, description: "Number of technical support specialists for remote diagnostics and field coordination." }
              },
              required: ["corporate", "cs", "techSupport"]
            },
            staffing_reasoning: {
                type: Type.STRING,
                description: "A specific, detailed justification for the proposed staffing numbers, explaining the logic behind the changes compared to the baseline or industry standards. MUST BE IN KOREAN."
            },
            capexFactors: {
              type: Type.OBJECT,
              description: "Factors for calculating central CAPEX.",
              properties: {
                hqCapexTiers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      threshold: { type: Type.NUMBER, description: "Total staff count threshold." },
                      cost: { type: Type.NUMBER, description: "Base CAPEX cost for HQ office." }
                    }
                  }
                },
                regionalCenterBaseCapex: { type: Type.NUMBER, description: "Base CAPEX per regional hub." },
                perEmployeeCapex: { type: Type.NUMBER, description: "Additional CAPEX per central employee." }
              },
              required: ["hqCapexTiers", "regionalCenterBaseCapex", "perEmployeeCapex"]
            },
            pnlInputs: {
              type: Type.OBJECT,
              description: "Industry-average values for P&L inputs.",
              properties: {
                procCost: { type: Type.NUMBER, description: "In-store processing cost per unit." },
                pkgCost: { type: Type.NUMBER, description: "Packaging and service menu cost per unit." },
                serviceCost: { type: Type.NUMBER, description: "Side menu cost per unit." },
                platformFeeRate: { type: Type.NUMBER, description: "Average delivery platform fee as a decimal." },
                avgRent: { type: Type.NUMBER, description: "Average monthly rent for a delivery-focused store." },
                utilitiesRate: { type: Type.NUMBER, description: "Utilities and consumables rate as a percentage of revenue." },
                wageMultiplier: { type: Type.NUMBER, description: "Competitive wage multiplier to apply to the base minimum wage." },
                threePlRate: { type: Type.NUMBER, description: "Third-party logistics cost as a percentage of COGS as a decimal." },
                automationSavingsRateB: { type: Type.NUMBER, description: "Labor savings rate for Level B automation as a decimal." }
              },
              required: ["procCost", "pkgCost", "serviceCost", "platformFeeRate", "avgRent", "utilitiesRate", "wageMultiplier", "threePlRate", "automationSavingsRateB"]
            },
            reasoning: {
              type: Type.OBJECT,
              description: "Specific, data-driven justifications for each of the pnlInputs values. MUST BE IN KOREAN.",
              properties: {
                procCost: { type: Type.STRING },
                pkgCost: { type: Type.STRING },
                serviceCost: { type: Type.STRING },
                platformFeeRate: { type: Type.STRING },
                avgRent: { type: Type.STRING },
                utilitiesRate: { type: Type.STRING },
                wageMultiplier: { type: Type.STRING },
                threePlRate: { type: Type.STRING },
                automationSavingsRateB: { type: Type.STRING }
              }
            }
          },
          required: ["cogsDiscountTiers", "capexDiscountTiers", "centerStaffSalaries", "staffing", "staffing_reasoning", "capexFactors", "pnlInputs", "reasoning"]
        };
    
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const aiData = JSON.parse(geminiResponse.text);
    return res.status(200).json(aiData);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'AI 서비스에서 데이터를 가져오는 데 실패했습니다.', details: error.message });
  }
};
