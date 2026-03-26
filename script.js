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
            if (e.currentTarget.id === 'settings-btn') return;
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchPage(e.currentTarget.getAttribute('data-target'));
        });
    });

    const activeLink = document.querySelector('.nav-links a.active');
    if (activeLink && activeLink.getAttribute('data-target')) switchPage(activeLink.getAttribute('data-target'));

    // --- API INTEGRATION: Settings & LocalStorage ---
    const apiKeyInput = document.getElementById('api-key-input');
    const saveBtn = document.getElementById('save-settings');
    const cancelBtn = document.getElementById('cancel-settings');
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');

    const openSettings = (e) => {
        if (e) e.preventDefault();
        apiKeyInput.value = localStorage.getItem('openai_api_key') || '';
        settingsModal.style.display = 'flex';
    };

    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);

    if (cancelBtn) cancelBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    if (saveBtn) saveBtn.addEventListener('click', () => {
        const val = apiKeyInput.value.trim();
        if (val) {
            localStorage.setItem('openai_api_key', val);
            showToast('API Key saved securely!', '🔒');
        } else {
            localStorage.removeItem('openai_api_key');
            showToast('API Key removed.', '🗑️');
        }
        settingsModal.style.display = 'none';
    });

    const getApiKey = () => {
        const key = localStorage.getItem('openai_api_key');
        if (!key) {
            showToast('Please set your OpenAI API Key first!', '⚠️');
            openSettings();
            return null;
        }
        return key;
    };

    // --- API INTEGRATION: Fetch OpenAI ---
    const SYSTEM_PROMPT = `You are an expert statistics professor preparing students for an exam. Your role:
1. Reproduce exercises in the SAME FORMAT as the sample test
2. Ensure FULL COVERAGE of the syllabus. Adapt difficulty to university midterm level.
3. Keep exact HTML formatting including the exact class names used in the original problem.
4. Use \\( ... \\) for inline math and \\[ ... \\] for block math (MathJax). Do NOT double escape backslashes.
5. Do NOT output markdown code blocks (like \`\`\`html). Only output raw HTML!`;

    const callOpenAI = async (messages) => {
        const apiKey = getApiKey();
        if (!apiKey) return null;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: messages,
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'API Error');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error(error);
            showToast(`Error: ${error.message}`, '❌');
            return null;
        }
    };

    // --- AUTO-GENERATE VARIANT ---
    document.querySelectorAll('.generate-btn:not(#save-settings)').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!getApiKey()) return;
            const btnParent = e.target.closest('.page');
            const problemContainer = btnParent.querySelector('.problem-container');
            const originalProblemText = problemContainer.innerHTML;
            
            showToast('Cooking a new problem formulation...', '✨');
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '⏳ Generating...';
            btn.disabled = true;

            const messages = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Please generate a NEW variant for the following problem HTML container. Use completely new context, numbers, and test different syllabus topics. You must return ONLY the raw replacement HTML.\nOriginal Problem HTML:\n${originalProblemText}` }
            ];

            const newContent = await callOpenAI(messages);
            
            btn.innerHTML = originalBtnText;
            btn.disabled = false;

            if (newContent) {
                const cleaned = newContent.replace(/^```html|```$/gm, '').trim();
                problemContainer.innerHTML = cleaned;
                
                if (window.MathJax) {
                    MathJax.typesetPromise([problemContainer]).then(() => {
                        showToast('Problem successfully updated!', '✅');
                    }).catch(err => {
                        console.error(err);
                        showToast('Problem updated (MathJax error)!', '⚠️');
                    });
                } else {
                    showToast('Problem successfully updated!', '✅');
                }
            }
        });
    });

    // --- SHOW CORRECTION ---
    document.querySelectorAll('.correction-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!getApiKey()) return;
            const btnParent = e.target.closest('.page');
            const problemContainer = btnParent.querySelector('.problem-container');
            const problemText = problemContainer.innerText;
            const chatDisplay = btnParent.querySelector('.chat-display');

            showToast('Consulting expert notes...', '✅');
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '⏳ Fetching...';
            btn.disabled = true;

            chatDisplay.innerHTML += `
                <div class="message" style="align-self: flex-end; background: var(--accent-primary); color: white;">
                    Teacher, please give me the correction for this exact problem.
                </div>
            `;
            chatDisplay.scrollTop = chatDisplay.scrollHeight;

            const messages = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Provide the correction for the following problem. Give the final answer, clear mathematical reasoning, and point out common mistakes. Format cleanly in HTML without wrapper tags. Use \\( ... \\) for math. Problem Text: ${problemText}` }
            ];

            const responseText = await callOpenAI(messages);
            
            btn.innerHTML = originalBtnText;
            btn.disabled = false;

            if (responseText) {
                const cleaned = responseText.replace(/^```html|```$/gm, '').trim();
                const aiResponseDiv = document.createElement('div');
                aiResponseDiv.className = 'message ai-message';
                aiResponseDiv.innerHTML = `<strong>Prof AI:</strong><br>${cleaned}`;
                
                chatDisplay.appendChild(aiResponseDiv);
                
                if (window.MathJax) {
                    MathJax.typesetPromise([aiResponseDiv]).then(() => {
                        chatDisplay.scrollTop = chatDisplay.scrollHeight;
                    });
                }
            }
        });
    });
    
    // --- CUSTOM CHAT INPUT ---
    document.querySelectorAll('.chat-input-area button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!getApiKey()) return;
            const input = e.target.previousElementSibling;
            const text = input.value.trim();
            if (!text) return;
            
            const btnParent = e.target.closest('.page');
            const problemContainer = btnParent.querySelector('.problem-container');
            const chatDisplay = btnParent.querySelector('.chat-display');

            showToast('Thinking...', '🌐');
            input.value = ''; 
            
            chatDisplay.innerHTML += `
                <div class="message" style="align-self: flex-end; background: var(--accent-primary); color: white;">
                    ${text}
                </div>
            `;
            chatDisplay.scrollTop = chatDisplay.scrollHeight;

            const messages = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Contextual problem currently on screen: ${problemContainer.innerText}\n\nStudent question: ${text}\n\nAnswer the student naturally, using HTML formatting for structure and \\( ... \\) for math.` }
            ];

            const responseText = await callOpenAI(messages);

            if (responseText) {
                const cleaned = responseText.replace(/^```html|```$/gm, '').trim();
                const aiResponseDiv = document.createElement('div');
                aiResponseDiv.className = 'message ai-message';
                aiResponseDiv.innerHTML = `<strong>Prof AI:</strong><br>${cleaned}`;
                
                chatDisplay.appendChild(aiResponseDiv);
                
                if (window.MathJax) {
                    MathJax.typesetPromise([aiResponseDiv]).then(() => {
                        chatDisplay.scrollTop = chatDisplay.scrollHeight;
                    });
                }
            }
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
