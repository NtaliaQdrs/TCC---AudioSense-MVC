document.addEventListener('DOMContentLoaded', function() {
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
                
                // Aqui você pode adicionar a lógica para aplicar as configurações
                const settingType = this.closest('.control-row').querySelector('h3').innerText;
                const value = this.querySelector('span:last-child').innerText;
                console.log(`Configuração alterada: ${settingType} para ${value}`);
            });
        });
    });

    // Controle do Slider de Velocidade
    const speedSlider = document.querySelector('input[type="range"]');
    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            console.log(`Velocidade de áudio: ${this.value}x`);
        });
    }

    // Fechar dica de acessibilidade
    const closeTipBtn = document.querySelector('.close-tip');
    const tipBox = document.querySelector('.accessibility-tip');
    if (closeTipBtn && tipBox) {
        closeTipBtn.addEventListener('click', function() {
            tipBox.style.display = 'none';
        });
    }
});
