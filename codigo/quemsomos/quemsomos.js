document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const userProfileContainer = document.getElementById('userProfileContainer');
    const loginLink = document.getElementById('loginLink');

    // Verifica se o usuário está logado
    if (usuarioLogado) {
        // Cria um link para a tela do usuário
        const link = document.createElement('a');
        link.href = "/codigo/telausuario/telausuario.html"; // URL para a tela do usuário
        link.style.display = 'inline-block'; // Para que o link se comporte como um bloco

        // Cria uma imagem para o perfil do usuário
        const img = document.createElement('img');
        img.src = usuarioLogado.profileImage; // A imagem do perfil
        img.alt = 'Foto de Perfil';
        img.className = 'profile-image'; // Adiciona a classe para estilizar
        img.style.width = '40px'; // Define a largura da imagem
        img.style.height = '40px'; // Define a altura da imagem
        img.style.borderRadius = '50%'; // Faz a imagem redonda
        img.style.marginLeft = '10px'; // Margem à esquerda

        // Adiciona a imagem ao link
        link.appendChild(img);
        // Adiciona o link ao container
        userProfileContainer.appendChild(link);
        // Oculta o link de login
        loginLink.style.display = 'none';
    }
});
