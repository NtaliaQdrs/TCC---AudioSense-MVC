document.addEventListener('DOMContentLoaded', function() {
    // Carregar configurações salvas
    loadSettings();

    // Seleção de botões em grupos
    const buttonGroups = document.querySelectorAll('.button-group');
    
    buttonGroups.forEach(group => {
        const buttons = group.querySelectorAll('.group-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active de todos no grupo
                buttons.forEach(b => b.classList.remove('active'));
                // Adiciona active ao clicado
                this.classList.add('active');
                
                const controlRow = this.closest('.control-row');
                const settingType = controlRow.querySelector('h3').innerText.toLowerCase();
                const value = this.querySelector('span:last-child').innerText;
                
                saveSetting(settingType, value);
                // Chama a função global definida no accessibility.js
                if (typeof aplicarPreferenciasSalvas === 'function') {
                    aplicarPreferenciasSalvas();
                }
            });
        });
    });

    // Controle do Slider de Velocidade
    const speedSlider = document.querySelector('input[type="range"]');
    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            const value = this.value;
            localStorage.setItem('audioSpeed', value);
        });
    }

    // Fechar dica de acessibilidade
    const closeTipBtn = document.querySelector('.close-tip');
    const tipBox = document.querySelector('.accessibility-tip');
    if (closeTipBtn && tipBox) {
        closeTipBtn.addEventListener('click', function() {
            tipBox.style.display = 'none';
            localStorage.setItem('hideAccessibilityTip', 'true');
        });
        
        if (localStorage.getItem('hideAccessibilityTip') === 'true') {
            tipBox.style.display = 'none';
        }
    }

    function saveSetting(type, value) {
        let key = '';
        if (type.includes('fonte')) key = 'fontSize';
        else if (type.includes('contraste')) key = 'contrast';
        else if (type.includes('tema')) key = 'theme';
        
        if (key) {
            localStorage.setItem(key, value);
        }
    }

    function loadSettings() {
        const fontSize = localStorage.getItem('fontSize');
        const contrast = localStorage.getItem('contrast');
        const theme = localStorage.getItem('theme');
        const audioSpeed = localStorage.getItem('audioSpeed');

        if (fontSize) setActiveButton('fonte', fontSize);
        if (contrast) setActiveButton('contraste', contrast);
        if (theme) setActiveButton('tema', theme);
        
        if (audioSpeed && speedSlider) {
            speedSlider.value = audioSpeed;
        }
    }

    function setActiveButton(type, value) {
        const rows = document.querySelectorAll('.control-row');
        rows.forEach(row => {
            const h3 = row.querySelector('h3');
            if (h3 && h3.innerText.toLowerCase().includes(type.toLowerCase())) {
                const buttons = row.querySelectorAll('.group-btn');
                buttons.forEach(btn => {
                    const btnText = btn.querySelector('span:last-child').innerText;
                    if (btnText === value) {
                        buttons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                });
            }
        });
    }
});
