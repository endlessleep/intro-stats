document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.nav-links a');
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
                // Handle basic HTML tags safely so we don't parse partial tags
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
                
                // Animate elements inside the page gracefully
                const blocks = page.querySelectorAll('.glass-panel, .concept-block, .ai-panel');
                blocks.forEach((block, index) => {
                    block.classList.remove('animate-in');
                    void block.offsetWidth; // Trigger reflow to restart animation natively
                    block.style.animationDelay = `${index * 0.08}s`;
                    block.classList.add('animate-in');
                });

                // Trigger typing effect for AI prompts
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
                // Reset typed state so it feels fresh if they return later
                const aiMessage = page.querySelector('.ai-message');
                if (aiMessage) delete aiMessage.dataset.typed;
            }
        });
    };

    // Event Listeners for Navigation
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            switchPage(e.currentTarget.getAttribute('data-target'));
        });
    });

    // Initialize the default page interactions
    const activeLink = document.querySelector('.nav-links a.active');
    if (activeLink) switchPage(activeLink.getAttribute('data-target'));

    // --- EXPERT PATTERN: Interactive Mock Actions ---
    document.querySelectorAll('.generate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Generating new problem variation via API...', '✨');
        });
    });

    document.querySelectorAll('.correction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Fetching step-by-step correction...', '✅');
        });
    });
    
    document.querySelectorAll('.chat-input-area button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.previousElementSibling;
            if (input.value.trim() !== '') {
                showToast('Connecting to OpenAI Server...', '🌐');
                // clear the input intuitively
                input.value = ''; 
            }
        });
    });

    // Support hitting Enter to send a chat message
    document.querySelectorAll('.chat-input-area input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.nextElementSibling.click();
            }
        });
    });
});

// --- AI Tutor System Prompt (For future backend integration) ---
/*
export const SYSTEM_PROMPT = \`
You are an expert statistics professor preparing students for an exam.

You have access to:
- The full course content
- A sample midterm test (5 problems)

Your role is to:
1. Reproduce exercises in the SAME FORMAT as the sample test
2. Ensure FULL COVERAGE of the syllabus (even topics not well covered in the sample)
3. Adapt difficulty to exam level (not easier, not harder)

CRITICAL RULES:
- NEVER change the structure of the exercise (same type, same number of questions)
- ALWAYS vary the concepts tested
- PRIORITIZE missing topics from the sample test:
  (counting, Bayes, conditional probability, independence, etc.)
- Exercises must feel like REAL exam questions

WHEN GENERATING AN EXERCISE:
- Keep exact format (e.g. True/False, definitions, calculation, etc.)
- Change numbers, context, AND concepts
- Cover different parts of the course
- Avoid repeating the same logic

WHEN ACTING AS A TUTOR:
- Guide step-by-step (do not give full answer immediately)
- Ask questions to help the student think
- Only give full solution if explicitly requested

WHEN CORRECTING:
- Provide:
  1. Final answer
  2. Clear reasoning
  3. Common mistakes to avoid

GOAL:
Simulate a real exam + a real professor helping the student succeed.
\`;
*/
