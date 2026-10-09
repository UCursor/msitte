document.addEventListener('DOMContentLoaded', () => {
    async function copyToClipboard(text) {
        if (!text) return false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const res = document.execCommand('copy');
                document.body.removeChild(ta);
                return res;
            }
        } catch (e) {
            console.error('Copy failed:', e);
            return false;
        }
    }

    const actionBtns = document.querySelectorAll('.docs-action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const copyType = btn.getAttribute('data-copy-type');
            let content = '';

            if (copyType === 'prompt') {
                const promptEl = document.querySelector('[data-prompt-content]');
                content = promptEl ? promptEl.getAttribute('data-prompt-content') || promptEl.innerText : 'read github.com/ucursor/msitte/blob/main/Skills.md $initiation';
            } else if (copyType === 'markdown') {
                const mainContent = document.querySelector('.docs-body');
                content = mainContent ? mainContent.innerText : document.title;
            }

            const success = await copyToClipboard(content);
            if (success) {
                const label = btn.querySelector('.btn-label');
                const origText = label ? label.textContent : '';
                btn.classList.add('copied');
                if (label) label.textContent = 'Copied!';

                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (label) label.textContent = origText;
                }, 2000);
            }
        });
    });

    const codeCopyBtns = document.querySelectorAll('.docs-code-copy-btn');
    codeCopyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const pre = btn.closest('.docs-code-block').querySelector('pre');
            if (!pre) return;
            const success = await copyToClipboard(pre.innerText);
            if (success) {
                const origHtml = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;color:#00f59b;">check</span><span>Copied</span>';
                setTimeout(() => {
                    btn.innerHTML = origHtml;
                }, 2000);
            }
        });
    });

    const docsSearchModal = document.getElementById('docsSearchModal');
    const docsSearchTrigger = document.getElementById('docsSearchTrigger');
    const docsSearchCloseBtn = document.getElementById('docsSearchCloseBtn');
    const docsSearchInput = document.getElementById('docsSearchInput');
    const docsSearchResultsList = document.getElementById('docsSearchResultsList');

    const searchIndex = [
        {
            title: 'Universal Installer',
            desc: 'Initiation command for Cursor, Claude Code, and AI agents: read github.com/ucursor/msitte/blob/main/Skills.md $initiation',
            displayUrl: 'msitte.pages.dev/',
            url: '/',
            category: 'Install'
        },
        {
            title: 'Other Agents Skill Link',
            desc: 'Direct skills reference for other agents and custom setups',
            displayUrl: 'msitte.pages.dev/skills',
            url: '/skills',
            category: 'Skills'
        },
        {
            title: 'Documentation: Overview & Initiation',
            desc: 'Guide to msitte / laucn, anti-cliche guardrails, and the $initiation command',
            displayUrl: 'msitte.pages.dev/docs',
            url: '/developers/docs/introduction.html',
            category: 'Docs'
        },
        {
            title: 'AI Signs: What AI Models Usually Do',
            desc: 'Breakdown of telltale AI flaws: purple-indigo gradients, unicode emoji icons, and broken placeholders',
            displayUrl: 'msitte.pages.dev/docs#ai-signs',
            url: '/developers/docs/introduction.html#ai-signs',
            category: 'Guardrails'
        },
        {
            title: 'webh.md Design Standards',
            desc: 'Strict negative constraints preventing non-functional mockups, emojis, and electric neon',
            displayUrl: 'msitte.pages.dev/docs#webh-rules',
            url: '/developers/docs/introduction.html#webh-rules',
            category: 'Standards'
        },
        {
            title: 'Discord Community',
            desc: 'Join the official msitte & laucn developer community on Discord',
            displayUrl: 'msitte.pages.dev/community',
            url: 'https://discord.gg/5KctFJj9Qk',
            category: 'Community',
            external: true
        },
        {
            title: 'GitHub Repository',
            desc: 'Official open source skills repository: @ucursor/msitte',
            displayUrl: 'msitte.pages.dev/github',
            url: 'https://github.com/ucursor/msitte',
            category: 'GitHub',
            external: true
        }
    ];

    let docSelectedIndex = 0;

    function renderDocsResults(query = '') {
        if (!docsSearchResultsList) return;
        const normalized = query.trim().toLowerCase();

        const filtered = searchIndex.filter(item => {
            if (!normalized) return true;
            return item.title.toLowerCase().includes(normalized) ||
                   item.desc.toLowerCase().includes(normalized) ||
                   item.displayUrl.toLowerCase().includes(normalized) ||
                   item.category.toLowerCase().includes(normalized);
        });

        if (filtered.length === 0) {
            docsSearchResultsList.innerHTML = `
                <div style="padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.45); font-size: 0.9rem;">
                    No results found for "${query}". Try searching "skills", "signs", or "initiation".
                </div>
            `;
            return;
        }

        docSelectedIndex = Math.min(docSelectedIndex, filtered.length - 1);

        docsSearchResultsList.innerHTML = filtered.map((item, idx) => `
            <a href="${item.url}" class="search-result-item ${idx === docSelectedIndex ? 'selected' : ''}" data-idx="${idx}" ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                <div class="search-result-info">
                    <div>
                        <div class="search-result-title">${item.title}</div>
                        <div class="search-result-desc">${item.desc}</div>
                        <div class="search-result-url">${item.displayUrl}</div>
                    </div>
                </div>
            </a>
        `).join('');

        docsSearchResultsList.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                closeDocsSearchModal();
            });
        });
    }

    function openDocsSearchModal() {
        if (!docsSearchModal) return;
        docsSearchModal.classList.add('open');
        docsSearchModal.setAttribute('aria-hidden', 'false');
        if (docsSearchInput) {
            docsSearchInput.value = '';
            docsSearchInput.focus();
        }
        docSelectedIndex = 0;
        renderDocsResults('');
    }

    function closeDocsSearchModal() {
        if (!docsSearchModal) return;
        docsSearchModal.classList.remove('open');
        docsSearchModal.setAttribute('aria-hidden', 'true');
    }

    if (docsSearchTrigger) {
        docsSearchTrigger.addEventListener('click', openDocsSearchModal);
    }

    if (docsSearchCloseBtn) {
        docsSearchCloseBtn.addEventListener('click', closeDocsSearchModal);
    }

    if (docsSearchModal) {
        docsSearchModal.addEventListener('click', (e) => {
            if (e.target === docsSearchModal) {
                closeDocsSearchModal();
            }
        });
    }

    if (docsSearchInput) {
        docsSearchInput.addEventListener('input', (e) => {
            docSelectedIndex = 0;
            renderDocsResults(e.target.value);
        });

        docsSearchInput.addEventListener('keydown', (e) => {
            const items = docsSearchResultsList.querySelectorAll('.search-result-item');
            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                docSelectedIndex = (docSelectedIndex + 1) % items.length;
                renderDocsResults(docsSearchInput.value);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                docSelectedIndex = (docSelectedIndex - 1 + items.length) % items.length;
                renderDocsResults(docsSearchInput.value);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const activeItem = items[docSelectedIndex];
                if (activeItem) {
                    activeItem.click();
                    closeDocsSearchModal();
                }
            } else if (e.key === 'Escape') {
                closeDocsSearchModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        const isF = e.key && e.key.toLowerCase() === 'f';
        const isTrigger = isF && (e.shiftKey || e.metaKey || e.ctrlKey);

        if (isTrigger && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
            e.preventDefault();
            if (docsSearchModal && docsSearchModal.classList.contains('open')) {
                closeDocsSearchModal();
            } else {
                openDocsSearchModal();
            }
        } else if (e.key === 'Escape' && docsSearchModal && docsSearchModal.classList.contains('open')) {
            closeDocsSearchModal();
        }
    });
});
