document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');
    const loginForm = document.getElementById('loginForm');

    // Função para validar e-mail
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Função para validar telefone (formato: (XX) XXXXX-XXXX)
    function validarTelefone(telefone) {
        const regex = /^\(\d{2}\) \d{5}-\d{4}$/;
        return regex.test(telefone);
    }

    if (cadastroForm) {
        const nome = document.getElementById('nome');
        const sobrenome = document.getElementById('sobrenome');
        const email = document.getElementById('email');
        const telefone = document.getElementById('telefone');
        const senha = document.getElementById('senha');
        const confirmarSenha = document.getElementById('confirmar-senha');
        const botaoCadastrar = cadastroForm.querySelector('button[type="submit"]');

        botaoCadastrar.addEventListener('click', async (event) => {
            event.preventDefault();

            // Verificação de campos obrigatórios
            if (!nome.value || !sobrenome.value || !email.value || !telefone.value || !senha.value || !confirmarSenha.value) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            // Validação de e-mail
            if (!validarEmail(email.value)) {
                alert('Por favor, insira um e-mail válido!');
                return;
            }

            // Validação de telefone
            if (!validarTelefone(telefone.value)) {
                alert('Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX!');
                return;
            }

            // Verificação de senha
            if (senha.value !== confirmarSenha.value) {
                alert('As senhas não coincidem!');
                return;
            }

            const usuario = {
                nome: nome.value,
                sobrenome: sobrenome.value,
                email: email.value,
                telefone: telefone.value,
                senha: senha.value,
                profileImage: "/codigo/telausuario/img/user-img/user-img.png" // Imagem padrão
            };

            try {
                const response = await fetch('http://localhost:3000/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(usuario)
                });

                if (!response.ok) {
                    throw new Error('Erro ao cadastrar usuário');
                }

                const data = await response.json();

                // Armazena o usuário no localStorage após confirmação do cadastro no servidor
                localStorage.setItem('usuarioLogado', JSON.stringify(data));

                alert('Usuário cadastrado com sucesso!');
                cadastroForm.reset();

                // Redirecionamento após o cadastro
                window.location.href = '/codigo/telausuario/telausuario.html';
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao cadastrar usuário: ' + error.message);
            }
        });
    }

    if (loginForm) {
        const email = document.getElementById('email');
        const senha = document.getElementById('senha');
        const botaoEntrar = loginForm.querySelector('button[type="submit"]');

        botaoEntrar.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                const response = await fetch('http://localhost:3000/usuarios');
                if (!response.ok) {
                    throw new Error('Erro ao buscar dados do servidor');
                }

                const usuarios = await response.json();
                const usuario = usuarios.find(user => user.email === email.value && user.senha === senha.value);

                if (usuario) {
                    alert('Login realizado com sucesso!');
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                    window.location.href = '/codigo/telausuario/telausuario.html';
                } else {
                    alert('E-mail ou senha incorretos!');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao realizar login: ' + error.message);
            }
        });
    }
});
