document.addEventListener('DOMContentLoaded', () => {
    // Verifica se há um usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const loginLink = document.getElementById('loginLink');
    const profileImage = document.createElement('img');

    // Se o usuário estiver logado, oculta o link de login e exibe a imagem do usuário
    if (usuarioLogado) {
        loginLink.style.display = 'none'; // Oculta o link de login

        // Configura a imagem do usuário
        profileImage.src = usuarioLogado.profileImage || '/telausuario/img/user-img/user-img.png'; // Use a imagem padrão se não houver
        profileImage.alt = 'Imagem do Usuário';
        profileImage.className = 'profile-image'; // Adiciona a classe para estilização

        // Adiciona um evento de clique à imagem do perfil para redirecionar para a tela do usuário
        profileImage.addEventListener('click', () => {
            window.location.href = '/codigo/telausuario/telausuario.html';
        });

        // Adiciona a imagem ao cabeçalho
        const headerRight = document.querySelector('.header-right');
        headerRight.appendChild(profileImage);
    }
});
