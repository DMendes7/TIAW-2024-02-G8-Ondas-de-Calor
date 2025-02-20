document.addEventListener('DOMContentLoaded', () => {
    const nomeElement = document.getElementById('nome');
    const sobrenomeElement = document.getElementById('sobrenome');
    const emailElement = document.getElementById('email');
    const profileImageElement = document.getElementById('profileImage');
    const editForm = document.getElementById('editForm');
    const editNome = document.getElementById('editNome');
    const editSobrenome = document.getElementById('editSobrenome');
    const oldSenha = document.getElementById('oldSenha');
    const newSenha = document.getElementById('newSenha');
    const profileImageUpload = document.getElementById('profileImageUpload');
    const editProfileButton = document.getElementById('editProfileButton');
    const logoutButton = document.getElementById('logout-button'); // Adicionado

    let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Função para exibir dados do usuário logado
    const displayUserData = () => {
        if (usuarioLogado) {
            nomeElement.textContent = usuarioLogado.nome;
            sobrenomeElement.textContent = usuarioLogado.sobrenome;
            emailElement.textContent = usuarioLogado.email;
            if (usuarioLogado.profileImage) {
                profileImageElement.src = usuarioLogado.profileImage;
            }
        } else {
            alert('Erro ao carregar dados do usuário.');
        }
    };

    // Função para atualizar dados do usuário
    const updateUserData = async (updatedUser) => {
        try {
            const response = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar dados do usuário');
            }

            const data = await response.json();
            alert('Dados atualizados com sucesso!');
            alert('Algumas informações serão atualizadas na próxima vez que você realizar o login.');
            localStorage.setItem('usuarioLogado', JSON.stringify(data));
            usuarioLogado = data;
            displayUserData();
            editForm.style.display = 'none';
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao atualizar dados do usuário: ' + error.message);
        }
    };

    editProfileButton.addEventListener('click', () => {
        // Alterna a exibição do formulário de edição
        if (editForm.style.display === 'block') {
            editForm.style.display = 'none'; // Esconde o formulário
        } else {
            editForm.style.display = 'block'; // Mostra o formulário
        }
    });
    

    // Evento para o formulário de edição
    editForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (oldSenha.value && oldSenha.value !== usuarioLogado.senha) {
            alert('Senha antiga incorreta!');
            return;
        }

        const updatedUser = {
            ...usuarioLogado,
            nome: editNome.value || usuarioLogado.nome,
            sobrenome: editSobrenome.value || usuarioLogado.sobrenome,
            senha: newSenha.value || usuarioLogado.senha
        };

        // Verifica se uma nova imagem de perfil foi carregada
        if (profileImageUpload.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                updatedUser.profileImage = reader.result;
                updateUserData(updatedUser);
            };
            reader.readAsDataURL(profileImageUpload.files[0]);
        } else {
            updateUserData(updatedUser);
        }
    });

    // Evento para o botão de logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Remove o usuário logado do localStorage
            localStorage.removeItem('usuarioLogado');

            // Redireciona para a tela de login
            window.location.href = '/codigo/Login/index.html';
        });
    }

    displayUserData();
});
