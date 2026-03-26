document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-links a.active, .nav-links a[data-target]');
    const pages = document.querySelectorAll('.page');

    // --- EXPERT PATTERN: Toast Notification System ---
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

    // --- EXPERT PATTERN: Typing Effect Logic ---
    const typeText = (element, text, speed = 15) => {
        element.innerHTML = '';
        element.classList.add('typing-cursor');
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                if(text.charAt(i) === '<') {
                    let tag = '';
                    while(text.charAt(i) !== '>' && i < text.length) {
                        tag += text.charAt(i);
                        i++;
                    }
                    tag += '>';
                    element.innerHTML += tag;
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
                setTimeout(typeWriter, speed);
            } else {
                element.classList.remove('typing-cursor');
            }
        }
        typeWriter();
    };

    // --- EXPERT PATTERN: Staggered Page Transition ---
    const switchPage = (targetId) => {
        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.add('active');
                
                const blocks = page.querySelectorAll('.glass-panel, .concept-block, .ai-panel');
                blocks.forEach((block, index) => {
                    block.classList.remove('animate-in');
                    void block.offsetWidth; 
                    block.style.animationDelay = `${index * 0.08}s`;
                    block.classList.add('animate-in');
                });

                if (targetId.startsWith('prob')) {
                    const aiMessage = page.querySelector('.ai-message');
                    if (aiMessage && !aiMessage.dataset.typed) {
                        const originalHTML = aiMessage.innerHTML;
                        aiMessage.dataset.typed = 'true';
                        setTimeout(() => typeText(aiMessage, originalHTML), 300);
                    }
                }
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
    if (activeLink && activeLink.getAttribute('data-target')) switchPage(activeLink.getAttribute('data-target'));

    // --- CHATGPT PRO BRIDGE (Clipboard Strategy) ---
    const SYSTEM_PROMPT = `You are an expert statistics professor preparing students for an exam. Your role:
1. Reproduce exercises in the SAME FORMAT as the sample test
2. Ensure FULL COVERAGE of the syllabus. Adapt difficulty to university midterm level.
3. Keep exact HTML formatting including the exact class names used in the original problem.
4. Use LaTeX for math inline and block.`;

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Prompt copié ! Ouvre ChatGPT et fais Cmd+V', '📋');
            // Wait a moment for the user to see the toast, then open ChatGPT
            setTimeout(() => {
                window.open('https://chatgpt.com/', '_blank');
            }, 1500);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            showToast('Prompt copié ! Ouvre ChatGPT et fais Cmd+V', '📋');
            setTimeout(() => {
                window.open('https://chatgpt.com/', '_blank');
            }, 1500);
        }
    };

    // Auto-Generate Variant Bridge
    document.querySelectorAll('.generate-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const btnParent = e.target.closest('.page');
            const problemContainer = btnParent.querySelector('.problem-container');
            const originalProblemText = problemContainer.innerText; 
            
            const prompt = `[CONTEXT: DUAL-ROLE TUTOR]
${SYSTEM_PROMPT}

[CURRENT EXAM PROBLEM]
${originalProblemText}

[YOUR TASK]
Please generate a NEW variant for this statistics problem. Use completely new context, numbers, and test different syllabus topics. You must act as the professor and give the student the URGENT new midterm variant directly. Structure it clearly so the student can solve it directly in this chat.`;

            await copyToClipboard(prompt);
        });
    });

    // Show Correction Bridge
    document.querySelectorAll('.correction-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const btnParent = e.target.closest('.page');
            const problemContainer = btnParent.querySelector('.problem-container');
            const problemText = problemContainer.innerText;

            const prompt = `[CONTEXT: EXPERT STATISTICS TUTOR]
${SYSTEM_PROMPT}

[CURRENT EXAM PROBLEM]
${problemText}

[YOUR TASK]
Provide the correction for this problem. Give the final answer clearly, step-by-step mathematical reasoning, and point out common mistakes that students make. Use a friendly, encouraging professor tone. Format it neatly.`;

            await copyToClipboard(prompt);
        });
    });
    
    // Custom Chat Input Bridge
    document.querySelectorAll('.chat-input-area button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const input = e.target.previousElementSibling;
            const text = input.value.trim();
            if (!text) return;
            
            const btnParent = e.target.closest('.page');
            const problemContainer = btnParent.querySelector('.problem-container');
            const problemText = problemContainer.innerText;

            input.value = ''; 

            const prompt = `[CONTEXT: EXPERT STATISTICS TUTOR]
[CURRENT EXAM PROBLEM]
${problemText}

[STUDENT QUESTION]
${text}

[YOUR TASK]
Answer the student's question accurately regarding the statistics problem above. Guide them step by step if they are stuck.`;

            await copyToClipboard(prompt);
        });
    });

    document.querySelectorAll('.chat-input-area input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.nextElementSibling.click();
            }
        });
    });
});
