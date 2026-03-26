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
    const SYSTEM_PROMPT = `You are an expert statistics professor preparing students for an exam. 
Your STRICT objective is to generate ONE new variant of the exact same problem structure, format, and difficulty.
1. Provide the newly generated problem FIRST (so the student can solve it).
2. Then, provide the step-by-step CORRECT ANSWER KEY clearly separated below it.

You MUST base your questions on the following topics:
- descriptive statistics (mean, median, variance, boxplot)
- probability (events, independence)
- conditional probability and Bayes
- counting (permutations, combinations)

CRITICAL RULE: YOU HAVE TO COVER these subjects that were not well represented in the sample test:
- counting
- Bayes theorem
- conditional probability

You MUST prioritize these missing topics. Change the context completely.
Use LaTeX for math.`;

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
});
