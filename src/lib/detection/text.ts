export interface TextAnalysisResult {
  authenticityScore: number
  verdict: string
  confidence: number
  analysis: {
    vocabularyAnalysis: {
      uniqueWordRatio: number
      avgWordLength: number
      aiPhrases: string[]
    }
    styleAnalysis: {
      sentenceLengthVariance: number
      paragraphUniformity: number
      contractionRatio: number
    }
    patternAnalysis: {
      repetitionScore: number
      transitionWordDensity: number
      formalityScore: number
    }
    overallSignals: string[]
  }
}

// Common AI phrases and patterns
const AI_PHRASES = [
  "it's important to note",
  "it's worth noting",
  "it's crucial to",
  "it's essential to",
  "in this article",
  "delve into",
  "dive deep into",
  "comprehensive guide",
  "comprehensive overview",
  "in conclusion",
  "to summarize",
  "firstly",
  "secondly",
  "thirdly",
  "furthermore",
  "moreover",
  "additionally",
  "consequently",
  "nevertheless",
  "nonetheless",
  "in today's world",
  "in the modern era",
  "it is important to",
  "one must consider",
  "it should be noted",
  "as mentioned earlier",
  "as we can see",
  "this demonstrates",
  "this illustrates",
  "play a crucial role",
  "plays a vital role"
]

const TRANSITION_WORDS = [
  "however", "therefore", "furthermore", "moreover", "additionally",
  "consequently", "nevertheless", "nonetheless", "thus", "hence",
  "accordingly", "subsequently", "meanwhile", "otherwise", "instead"
]

export function analyzeText(text: string): TextAnalysisResult {
  const signals: string[] = []
  let aiScore = 0

  // Normalize text
  const normalizedText = text.toLowerCase()
  const words = text.match(/\b[a-zA-Z]+\b/g) || []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)

  if (words.length < 20) {
    return {
      authenticityScore: 50,
      verdict: "UNCERTAIN",
      confidence: 0.3,
      analysis: {
        vocabularyAnalysis: { uniqueWordRatio: 0, avgWordLength: 0, aiPhrases: [] },
        styleAnalysis: { sentenceLengthVariance: 0, paragraphUniformity: 0, contractionRatio: 0 },
        patternAnalysis: { repetitionScore: 0, transitionWordDensity: 0, formalityScore: 0 },
        overallSignals: ["Text too short for accurate analysis"],
      },
    }
  }

  // 1. Check for AI phrases
  const foundAiPhrases: string[] = []
  for (const phrase of AI_PHRASES) {
    if (normalizedText.includes(phrase)) {
      foundAiPhrases.push(phrase)
      aiScore += 8
    }
  }
  
  if (foundAiPhrases.length > 0) {
    signals.push(`Found ${foundAiPhrases.length} AI-typical phrase(s)`)
  }

  // 2. Vocabulary analysis
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  const uniqueWordRatio = uniqueWords.size / words.length
  
  // AI tends to have lower unique word ratio (more repetitive)
  if (uniqueWordRatio < 0.4) {
    signals.push("Low vocabulary diversity")
    aiScore += 10
  }

  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length

  // 3. Sentence length variance
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length)
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
  const sentenceVariance = sentenceLengths.reduce((sum, len) => 
    sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length
  
  // AI tends to have more uniform sentence lengths
  if (sentenceVariance < 15 && sentences.length > 3) {
    signals.push("Very uniform sentence lengths")
    aiScore += 12
  }

  // 4. Paragraph uniformity
  let paragraphUniformity = 0
  if (paragraphs.length > 2) {
    const paraLengths = paragraphs.map(p => p.length)
    const avgParaLength = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length
    const paraVariance = paraLengths.reduce((sum, len) =>
      sum + Math.pow(len - avgParaLength, 2), 0) / paraLengths.length
    const paraCV = Math.sqrt(paraVariance) / avgParaLength
    paragraphUniformity = 1 - Math.min(paraCV, 1)
    
    if (paraCV < 0.3) {
      signals.push("Very uniform paragraph lengths")
      aiScore += 10
    }
  }

  // 5. Contraction usage
  const contractions = text.match(/\b\w+'\w+\b/g) || []
  const contractionRatio = contractions.length / sentences.length
  
  // AI often avoids contractions in formal text
  if (contractionRatio < 0.05 && words.length > 100) {
    signals.push("Very low contraction usage")
    aiScore += 8
  }

  // 6. Transition word density
  let transitionCount = 0
  for (const word of TRANSITION_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = normalizedText.match(regex)
    if (matches) transitionCount += matches.length
  }
  const transitionDensity = transitionCount / sentences.length
  
  // AI often overuses transition words
  if (transitionDensity > 0.5) {
    signals.push("High transition word density")
    aiScore += 10
  }

  // 7. Repetition analysis (bigrams)
  const bigrams = new Map<string, number>()
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i].toLowerCase()} ${words[i + 1].toLowerCase()}`
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1)
  }
  
  let repeatedBigrams = 0
  for (const count of bigrams.values()) {
    if (count > 2) repeatedBigrams += count - 2
  }
  const repetitionScore = (repeatedBigrams / bigrams.size) * 100
  
  if (repetitionScore > 10) {
    signals.push("High phrase repetition")
    aiScore += 8
  }

  // 8. List/bullet point detection
  const listPatterns = text.match(/^[\s]*[-•*]\s/gm) || []
  const numberedPatterns = text.match(/^[\s]*\d+[.)]\s/gm) || []
  if (listPatterns.length > 5 || numberedPatterns.length > 5) {
    signals.push("Heavy use of lists/bullet points")
    aiScore += 5
  }

  // 9. Check for perfect grammar indicators
  // AI rarely makes typos or grammatical errors
  const typoPatterns = text.match(/\b(teh|adn|taht|waht|becuase|recieve|occured)\b/gi) || []
  if (typoPatterns.length === 0 && words.length > 200) {
    // No typos in long text is slightly suspicious
    aiScore += 3
  }

  // Calculate final score
  const aiProbability = Math.min(aiScore / 100, 1)
  const authenticityScore = Math.round((1 - aiProbability) * 100)

  // Determine verdict
  let verdict: string
  if (authenticityScore >= 80) {
    verdict = "AUTHENTIC"
  } else if (authenticityScore >= 60) {
    verdict = "LIKELY_AUTHENTIC"
  } else if (authenticityScore >= 40) {
    verdict = "UNCERTAIN"
  } else if (authenticityScore >= 20) {
    verdict = "LIKELY_AI_GENERATED"
  } else {
    verdict = "AI_GENERATED"
  }

  // Calculate confidence
  const confidence = signals.length > 0
    ? Math.min(0.4 + (signals.length * 0.08), 0.9)
    : 0.4

  return {
    authenticityScore,
    verdict,
    confidence,
    analysis: {
      vocabularyAnalysis: {
        uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
        avgWordLength: Math.round(avgWordLength * 10) / 10,
        aiPhrases: foundAiPhrases,
      },
      styleAnalysis: {
        sentenceLengthVariance: Math.round(sentenceVariance),
        paragraphUniformity: Math.round(paragraphUniformity * 100) / 100,
        contractionRatio: Math.round(contractionRatio * 100) / 100,
      },
      patternAnalysis: {
        repetitionScore: Math.round(repetitionScore),
        transitionWordDensity: Math.round(transitionDensity * 100) / 100,
        formalityScore: contractionRatio < 0.1 ? 0.8 : 0.4,
      },
      overallSignals: signals,
    },
  }
}
