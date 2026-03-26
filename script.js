document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-links a');
    const pages = document.querySelectorAll('.page');

    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    window.showToast = (message, icon = '🤖') => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const switchPage = (targetId) => {
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.add('active');
                
                const blocks = page.querySelectorAll('.glass-panel, .concept-block');
                blocks.forEach((block, index) => {
                    block.classList.remove('animate-in');
                    void block.offsetWidth; 
                    block.style.animationDelay = `${index * 0.08}s`;
                    block.classList.add('animate-in');
                });
            } else {
                page.classList.remove('active');
            }
        });
    };

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchPage(e.currentTarget.getAttribute('data-target'));
        });
    });

    const activeLink = document.querySelector('.nav-links a.active');
    if (activeLink) switchPage(activeLink.getAttribute('data-target'));

    // --- PROMPT GENERATOR BRIDGE ---
    // --- PROMPT GENERATOR BRIDGE ---
    const SYSTEM_PROMPT = `[ROLE & CONTEXT]
You are a distinguished University Professor of Statistics designing rigorous midterm examination variants.

[OBJECTIVE]
Generate a NEW, unique variant of the provided problem while strictly adhering to its core difficulty level and formatting. First provide the problem text for the student, then explicitly separate and provide the detailed, step-by-step Correct Answer Key.

[COVERAGE & SYLLABUS DIRECTIVES]
You must design the new variant to test the student comprehensively using a dynamic mix of the following core topics:
1. Descriptive Statistics (mean, median, variance, boxplots)
2. Fundamental Probability (events, disjoints, independence)
3. Advanced Probability (Conditional Probability, Bayes' Theorem)
4. Combinatorics (Permutations, Combinations, rules of counting)

URGENT PRIORITY RE-BALANCING: 
The original exam heavily under-represented Combinatorics, Bayes' Theorem, and Conditional Probability. 
Therefore, you MUST creatively embed at least one complex question from these three under-represented topics into your new variant. Be sure to seamlessly integrate Descriptive Statistics so it is not neglected.

[FORMATTING RULES]
- Completely reinvent the scenario, numbers, and context (do not just swap nouns).
- Use proper LaTeX formatting for all mathematical notation (both block and inline).
- Maintain an encouraging but academically rigorous tone in the solution key.`;

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Prompt copié ! Ouvre ChatGPT et fais Cmd+V', '📋');
            setTimeout(() => window.open('https://chatgpt.com/', '_blank'), 1500);
        } catch (err) {
            console.error('Failed to copy: ', err);
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            showToast('Prompt copié ! Ouvre ChatGPT et fais Cmd+V', '📋');
            setTimeout(() => window.open('https://chatgpt.com/', '_blank'), 1500);
        }
    };

    document.querySelectorAll('.generate-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const btnParent = e.target.closest('.glass-panel'); 
            const title = btnParent.querySelector('h3').innerText;
            const problemText = btnParent.querySelector('.problem-content').innerText; 
            
            const prompt = `[CONTEXT: DUAL-ROLE TUTOR]
${SYSTEM_PROMPT}

[CURRENT EXAM PROBLEM (${title})]
${problemText}

[YOUR TASK]
Please generate a NEW variant for this statistics problem honoring the prioritized topics above. Build the new problem text first, followed by the solution key.`;

            await copyToClipboard(prompt);
        });
    });

    // --- ADVANCED GENERATOR BRIDGE ---
    const ADVANCED_PROMPT = `[CONTEXT: EXAM GENERATOR – ADVANCED]

You are a university statistics professor designing ORIGINAL midterm exercises.

[OBJECTIVE]
Generate ONE new, original exam-style problem worth 4–5 points.

This must NOT be a variation of the sample test.  
It must be a NEW type of problem that could realistically appear in the exam.

[TOPICS YOU MUST USE]
You must base the exercise on one or a combination of:
- descriptive statistics (mean, variance, boxplot, interpretation)
- probability (events, independence, inclusion-exclusion)
- conditional probability and Bayes theorem
- combinatorics (permutations, combinations, counting)

[CRITICAL REQUIREMENTS]
- The exercise must require reasoning (not just plugging formulas)
- It must combine concepts if possible (e.g., counting + probability, or Bayes + interpretation)
- Avoid simple computation-only questions
- Avoid copying structures from the sample test

[DIFFICULTY]
Match a real university midterm (intermediate level, not trivial, not impossible). First provide the problem text for the student, then explicitly separate and provide the detailed, step-by-step Correct Answer Key. Use proper LaTeX for all math.`;

    document.querySelector('.generate-advanced-btn')?.addEventListener('click', async () => {
        await copyToClipboard(ADVANCED_PROMPT);
    });
});
