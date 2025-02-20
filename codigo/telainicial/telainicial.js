document.addEventListener('DOMContentLoaded', function() {
    const chaveApi = 'f80457bfc7caba5f9e41db7379b3f059';

    let map;
    let service;
    let infowindow;
    let markers = []; // Array para armazenar os marcadores
    
    function initMap(lat, lon) {
        var mapOptions = {
            center: new google.maps.LatLng(lat, lon),
            zoom: 10
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
        // Adiciona um marcador na localização do usuário
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            title: "Você está aqui"
        });
    
        // Inicializa o serviço de lugares
        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
    
        // Adiciona evento de submissão ao formulário de categorias
        document.getElementById('category-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const category = document.getElementById('category-select').value;
            searchCategory(category, lat, lon);
        });
    }
    
    function searchCategory(category, lat, lon) {
        // Limpa os marcadores antigos
        clearMarkers();
    
        const request = {
            location: new google.maps.LatLng(lat, lon),
            radius: '5000', // Define o raio de busca em metros
            type: [category]
        };
    
        service.nearbySearch(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
            } else {
                console.error('Erro ao buscar lugares:', status);
            }
        });
    }
    
    function createMarker(place) {
        const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
    
        markers.push(marker); // Adiciona o marcador ao array
    
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
    }
    
    function clearMarkers() {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null); // Remove o marcador do mapa
        }
        markers = []; // Limpa o array de marcadores
    }
    
    // Tenta obter a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(posicao => {
            const lat = posicao.coords.latitude;
            const lon = posicao.coords.longitude;
            buscarDadosClimaticos(lat, lon);
            initMap(lat, lon); // Inicializa o mapa com a localização do usuário
        }, error => {
            console.error('Erro ao obter localização:', error);
            const containerClima = document.getElementById('weather');
            containerClima.innerHTML = '<p>Erro ao obter localização. Por favor, use a barra de pesquisa para encontrar uma localização.</p>';
        });
    } else {
        const containerClima = document.getElementById('weather');
        containerClima.innerHTML = '<p>Geolocalização não é suportada pelo seu navegador. Por favor, use a barra de pesquisa para encontrar uma localização.</p>';
    }
    
    
      
        
    // Configura o formulário de pesquisa
    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const localizacao = document.getElementById('search-input').value;
        buscarCoordenadas(localizacao);
    });

    // Configura o campo de entrada para buscar sugestões
    document.getElementById('search-input').addEventListener('input', function() {
        const query = this.value;
        if (query.length > 2) {
            buscarSugestoes(query);
        } else {
            document.getElementById('suggestions').innerHTML = '';
        }
    });

    // Função para buscar sugestões de localizações
    function buscarSugestoes(query) {
        const urlGeocoding = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${chaveApi}`;
        fetch(urlGeocoding)
            .then(response => response.json())
            .then(dados => {
                const suggestionsContainer = document.getElementById('suggestions');
                suggestionsContainer.innerHTML = '';
                dados.forEach(localizacao => {
                    const div = document.createElement('div');
                    div.textContent = `${localizacao.name}, ${localizacao.state ? localizacao.state + ', ' : ''}${localizacao.country}`;
                    div.addEventListener('click', () => {
                        document.getElementById('search-input').value = div.textContent;
                        suggestionsContainer.innerHTML = '';
                        buscarCoordenadas(div.textContent);
                    });
                    suggestionsContainer.appendChild(div);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar sugestões:', error);
            });
    }

    // Função para buscar coordenadas de uma localização
    function buscarCoordenadas(localizacao) {
        const urlGeocoding = `https://api.openweathermap.org/geo/1.0/direct?q=${localizacao}&limit=1&appid=${chaveApi}`;
        fetch(urlGeocoding)
            .then(response => response.json())
            .then(dados => {
                if (dados.length > 0) {
                    const lat = dados[0].lat;
                    const lon = dados[0].lon;
                    buscarDadosClimaticos(lat, lon);
                } else {
                    alert('Localização não encontrada.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar coordenadas:', error);
                alert('Erro ao buscar coordenadas.');
            });
    }

    // Função para buscar e exibir dados climáticos
    function buscarDadosClimaticos(lat, lon) {
        const urlClima = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${chaveApi}&units=metric&lang=pt_br`;
        const urlPrevisao = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${chaveApi}&units=metric&lang=pt_br`;
        const urlPrevisaoDiaria = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${chaveApi}&units=metric&lang=pt_br`;
        const urlQualidadeAr = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${chaveApi}`;

        // Busca dados climáticos atuais
        fetch(urlClima)
            .then(response => response.json())
            .then(dados => {
                const containerClima = document.getElementById('weather');
                const containerLocalizacao = document.getElementById('location');
                const imgIconeClima = document.getElementById('weather-icon-img');
                const temperatura = dados.main.temp;
                const descricao = dados.weather[0].description;
                const umidade = dados.main.humidity;
                const velocidadeVento = dados.wind.speed;
                const direcaoVento = dados.wind.deg;
                const iconeClima = dados.weather[0].icon;
                const cidade = dados.name;

                containerLocalizacao.innerHTML = `<p>Localização: ${cidade}</p>`;
                containerClima.innerHTML = `
                    <p>Temperatura Atual: ${temperatura}°C</p>
                    <p>Descrição: ${descricao}</p>
                    <p>Umidade: ${umidade}%</p>
                `;
                imgIconeClima.src = `http://openweathermap.org/img/wn/${iconeClima}.png`;
                document.getElementById('wind-speed').innerText = velocidadeVento;
                document.getElementById('wind-direction').src = obterImagemDirecaoVento(direcaoVento);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
                const containerClima = document.getElementById('weather');
                containerClima.innerHTML = '<p>Erro ao carregar dados.</p>';
            });

        // Busca dados de previsão climática
        fetch(urlPrevisao)
            .then(response => response.json())
            .then(dados => {
                const agora = new Date();
                const labels = [];
                const temperaturas = [];

                for (let i = 0; i < 12; i++) {
                    const horaPrevisao = new Date(agora.getTime() + i * 60 * 60 * 1000);
                    const dadosPrevisao = dados.list.find(item => {
                        const horaItem = new Date(item.dt * 1000);
                        return horaItem.getHours() === horaPrevisao.getHours();
                    });

                    if (dadosPrevisao) {
                        labels.push(`${horaPrevisao.getHours()}:00`);
                        temperaturas.push(dadosPrevisao.main.temp);
                    }
                }

                atualizarGrafico(labels, temperaturas);
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
                const containerClima = document.getElementById('weather');
                containerClima.innerHTML = '<p>Erro ao carregar dados.</p>';
            });

        // Busca dados de previsão diária
        fetch(urlPrevisaoDiaria)
            .then(response => response.json())
            .then(dados => {
                console.log(dados); // Inspecione a estrutura aqui
                const containerTempMax = document.getElementById('temp-max');
                const containerTempMin = document.getElementById('temp-min');
                const containerUV = document.getElementById('uv');
                const containerQualidadeAr = document.getElementById('air-quality-index');
                const containerAlertas = document.getElementById('heat-alerts');

                if (dados.daily && Array.isArray(dados.daily) && dados.daily.length > 0) {
                    const tempMax = dados.daily[0].temp.max;
                    const tempMin = dados.daily[0].temp.min;
                    const indiceUV = dados.daily[0].uvi;
                    const alertas = dados.alerts && dados.alerts.length > 0 
                        ? dados.alerts.map(alerta => `${alerta.event} - ${new Date(alerta.start * 1000).toLocaleString()}`).join(', ') 
                        : 'Nenhum alerta atual';

                    containerTempMax.innerHTML = `${tempMax}°C`;
                    containerTempMin.innerHTML = `${tempMin}°C`;
                    containerUV.innerHTML = indiceUV;
                    containerQualidadeAr.innerHTML = obterDescricaoQualidadeAr(indiceUV);
                    containerAlertas.innerHTML = alertas;
                } else {
                    console.error('Dados diários não disponíveis', dados);
                    containerTempMax.innerHTML = 'N/A';
                    containerTempMin.innerHTML = 'N/A';
                    containerUV.innerHTML = 'N/A';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados da API:', error);
                const containerPrevisao = document.getElementById('forecast');
                containerPrevisao.innerHTML = '<p>Erro ao carregar dados.</p>';
            });

        // Busca dados de qualidade do ar
        fetch(urlQualidadeAr)
            .then(response => response.json())
            .then(dados => {
                const containerQualidadeAr = document.getElementById('air-quality-index');
                const indiceQualidadeAr = dados.list[0].main.aqi; // Índice de qualidade do ar (1-5)
                containerQualidadeAr.innerHTML = obterDescricaoQualidadeAr(indiceQualidadeAr);
            })
            .catch(error => {
                console.error('Erro ao buscar dados de qualidade do ar:', error);
                const containerQualidadeAr = document.getElementById('air-quality-index');
                containerQualidadeAr.innerHTML = '<p>Erro ao carregar dados.</p>';
            });
    }

    // Atualiza o gráfico com os dados de temperatura
    function atualizarGrafico(labels, temperaturas) {
        const ctx = document.getElementById('tempChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperaturas Horárias',
                    data: temperaturas,
                    borderColor: 'rgba(0, 0, 0, 1)', // Cor da linha
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Cor de fundo da linha
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        ticks: {
                            color: 'black' // Cor dos rótulos do eixo x
                        }
                    },
                    y: {
                        ticks: {
                            color: 'black' // Cor dos rótulos do eixo y
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'black' // Cor das legendas
                        }
                    }
                }
            }
        });
    }

    // Retorna a imagem correspondente à direção do vento
    function obterImagemDirecaoVento(grau) {
        const direcoes = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const indice = Math.round(grau / 45) % 8;
        const direcao = direcoes[indice];
        return `img/${direcao}.png`;
    }

    // Retorna a descrição da qualidade do ar com base no índice
    function obterDescricaoQualidadeAr(aqi) {
        switch (aqi) {
            case 1:
                return 'Bom';
            case 2:
                return 'Moderado';
            case 3:
                return 'Ruim';
            case 4:
                return 'Muito Ruim';
            case 5:
                return 'Perigoso';
            default:
                return 'Desconhecido';
        }
    }
});
