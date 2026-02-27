

export const SCRIPT_STYLES = {
    '구매전환 중심 스타일': {
        '1-1': 'Pain Point → 즉시 해결형',
        '1-2': 'Benefit 3단 압축형',
        '1-3': 'Before–After 비교형',
        '1-4': 'Use Case 몰입형',
        '1-5': '가격·혜택 집중형',
    },
    '브랜드 아이덴티티 강화 스타일': {
        '2-1': '브랜드 스토리텔링형',
        '2-2': '시네마틱 룩북형',
        '2-3': '감성 나레이션형',
        '2-4': '프리미엄 디테일 강조형',
    },
    '신뢰·전문성 기반 스타일': {
        '3-1': 'Industry Secret 공개형',
        '3-2': '과학적 원리 설명형',
        '3-3': '객관 비교 분석형',
        '3-4': '재료·소재 전문형',
    },
    '현장 실연·액션 중심 스타일': {
        '4-1': '즉시 실연형',
        '4-2': '상품 구성 중심형',
        '4-3': '모델 워킹 중심형',
        '4-4': '요리·테이블링 중심형',
    },
    '모바일·숏폼 스타일': {
        '5-1': '1초 훅형',
        '5-2': '3초 결론형',
        '5-3': '밈·트렌드형',
        '5-4': '제품 단독 임팩트형',
    },
    '고객 공감·감정 기반 스타일': {
        '6-1': '1인칭 경험담형',
        '6-2': '관계 기반형',
        '6-3': '일상 스냅형',
        '6-4': '긍정 루틴형',
    }
};

export const CATEGORY_STYLES: Record<string, string> = {
    '1. 패션 (Fashion)': 'Runway tracking, fabric texture macro, city snap, wind silhouette, monochrome studio. 시네마틱 패션 룩북을 위한 카메라·조명·질감 기반 프리셋.',
    '2. 언더웨어 (Underwear)': 'Seamless macro, lace pattern scan, skin-fit silhouette, T-shirt invisible layering. 자연광·부드러운 곡선·피부톤 조화 중심.',
    '3. 이미용 (Beauty)': 'Waterdrop macro, serum drop, pore-blur, floral aroma FX, spa daylight. 정확한 제형 질감·피부 변화·Before/After 연출 가이드.',
    '4. 레포츠 의류 (Sportswear)': 'High-speed running, water repel test, neon kinetic, yoga slow flex. 역동적 모션·기능성 원단·아웃도어 톤 중심.',
    '5. 패션잡화 (Accessories)': 'Leather grain macro, jewelry shine, mirror try-on, travel styling. 가죽·금속·패턴의 극정밀 디테일 표현 가이드.',
    '6. 건강식품 (Health Food)': 'Ingredient flatlay, dissolve-in-water macro, lab tone, morning routine. 제형·원재료·효능 정보 전달 중심.',
    '7. 신선/가공식품 (Food)': 'Moist macro, cut-through knife, steam/smoke, fine dining plating. 식감·촉촉함·조리 과정 중심의 시네마틱 푸드 영상.',
    '8. 생활/주방용품 (Living)': 'POV usage, cleaning Before/After, durability test, Scandinavian interior. 실사용 중심의 현실적 공간·조명 가이드.',
    '9. 가전/디지털 (Electronics)': 'UI macro, power-on cinematic, tech multi-angle, exploded-view render. 프리미엄 테크·라이프스타일 연출.',
    '10. 가구/침구 (Furniture)': 'Sunlight texture, bedding styling, cushion test, luxury interior. 텍스처·공간 배치·프리미엄 호텔 무드 중심.'
};

export const SCRIPT_STYLES_MASTER_PROMPT = `
You are an expert AI video script director specializing in creating professional VEO3 video prompts for product commercials. You will be given product information, a specific "Script Style", and a "Target Video Duration".

Your task is to generate a complete VEO3 VIDEO PROMPT structure in JSON format.

**Structure Requirements:**
- **Total Duration:** Must align with the provided "Target Video Duration".
- **Shot List:** Divide the narrative into a sequence of shots.
- **Shot Duration Rule:** Each individual shot must be between **1.5 seconds and 2.5 seconds** long. Do NOT create long static shots. Keep the cuts dynamic based on the action intensity and narrative flow.
- **Fields per Shot:**
  - \`time\`: Duration of the shot (e.g., "0.0s - 2.0s", "2.0s - 4.5s").
  - \`title\`: Short title of the shot.
  - \`description\`: **KOREAN**. A purely visual description of the scene. NO TEXT, NO LOGOS.
  - \`englishPrompt\`: **ENGLISH**. A highly detailed visual prompt for an AI image generator. Include subject, action, environment, lighting, style, and camera angle. NO TEXT IN IMAGE.
  - \`camera\`: Camera type/angle (e.g., "Low Angle", "Drone Shot").
  - \`lens\`: Lens specification (e.g., "35mm", "85mm f/1.2").
  - \`motion\`: Camera or subject motion (e.g., "Slow dolly-in", "Pan right").
  - \`lighting\`: Lighting setup (e.g., "Golden hour", "Soft studio light").
  - \`transition\`: Transition to the next shot (e.g., "Cut", "Cross dissolve", "Wipe").
  - \`soundEffect\`: Suggested sound design (e.g., "Sizzle sound", "Upbeat upbeat music").

**Output JSON Structure:**
The output MUST be a single valid JSON object with these keys:
\`\`\`json
{
  "productName": "String",
  "duration": "String",
  "format": "String",
  "narrativeSummary": "String",
  "visualIdentity": "String",
  "motionRules": "String",
  "negativePrompts": "String",
  "shotList": [
    {
      "time": "String",
      "title": "String",
      "description": "String (Korean)",
      "englishPrompt": "String (English - strictly visual)",
      "camera": "String",
      "lens": "String",
      "motion": "String",
      "lighting": "String",
      "transition": "String",
      "soundEffect": "String"
    }
  ]
}
\`\`\`

**CRITICAL RULES:**
1.  **NO TEXT IN IMAGES:** The \`description\` and \`englishPrompt\` must strictly describe visual elements. Do NOT write "Text appears", "Logo shows", or "Subtitle". The generated images must be clean.
2.  **CONSISTENCY:** Ensure the visual identity (colors, mood) is consistent across all shots.
3.  **PROFESSIONALISM:** Use cinematic terminology for camera, lens, and lighting.
4.  **PACING:** Ensure shots are short (1.5s - 2.5s) to maintain a modern, engaging pace.

---

**SPECIFIC STYLE GUIDELINES (Apply these strictly if the Script Style ID matches):**

**Style ID: 4-2 (상품 구성 중심형 / Product Composition Focused)**
- **Concept:** Clearly visualize the full product composition (quantity, options, packages, components) like a premium home shopping display.
- **Visual Direction:** Top-view / Knolling (Uniform Grid) / Split-screen for color options.
- **Motion:** Minimal movement. Slow push-in (Dolly-in) or Micro orbit (<10°). Avoid complex moves that obscure the layout.
- **Lighting:** Softbox 3-point, Soft edge shadow, High-key white tone to minimize shadows and show product clearly.
- **Shot Structure Guide:**
  1. **Full Composition (Knolling):** Top-down shot of all components aligned perfectly.
  2. **Key Component Close-up:** Focus on texture/design of 2-3 main items.
  3. **Lineup/Split:** Split screen showing different color options or variations.
  4. **Usage/Package:** "Here is what you get" visualization.

**Style ID: 4-4 (요리·테이블링 중심형 / Cooking & Tabling Focused)**
- **Concept:** Focus on the act of cooking, plating, and the dining flow. Not just a static food shot, but the "process" and "enjoyment".
- **Visual Direction:** Warm Tone + Soft White Fill. Emphasize freshness (moisture, steam, texture).
- **Motion:** Slow motion (2x-4x) for rhythmic cooking actions. Macro close-ups. Smooth dolly & micro-arc. Top-down transitioning to 45°.
- **Lighting:** Natural daylight soft, Back rim + Side fill, High CRI lighting to pop food textures.
- **Shot Structure Guide:**
  1. **Ingredients (Top-down):** Fresh materials on wood/marble/tile board.
  2. **Cooking Action:** Water pouring, sizzling, steam, rhythmic chopping or stirring.
  3. **Plating Flow:** Pouring sauce, placing the main ingredient, finishing touch.
  4. **Table Styling:** Wine, napkins, cutlery setting the dining mood.
  5. **Hero Dish:** 45° angle shot of the finished dish, appetizing sheen, slow dolly-out.
`;
