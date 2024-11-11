const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Initialize state and order objects
let state = 'saudacao';
let order = {
    items: [],
    currentCategory: null,
    categoryName: null
};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async msg => {
    const message = msg.body.toLowerCase();

    if (state === 'saudacao') {
        state = 'menu';
        await msg.reply('Olá! 👋 Seja bem-vindo à nossa pizzaria!\nDeseja ver o nosso cardápio? Digite "Sim" para ver o cardápio ou enviarei uma imagem do cardápio digitando "foto".');
    
    } else if (state === 'menu' && (message === 'sim' || message === 'foto')) {
        if (message === 'foto') {
            try {
                const media = MessageMedia.fromFilePath('./cardapio.jpg');
                await client.sendMessage(msg.from, media, {caption: 'Aqui está nosso cardápio! 📄'});
                state = 'categoria';
                await msg.reply('Agora, escolha uma categoria:\n1. Pizzas\n2. Lanches\n3. Bebidas\n4. Salgados\n5. Pratos');
            } catch (error) {
                console.error('Erro ao enviar imagem:', error);
                state = 'categoria';
                await msg.reply('Desculpe, não foi possível enviar a imagem do cardápio. Por favor, escolha uma categoria:\n1. Pizzas\n2. Lanches\n3. Bebidas\n4. Salgados\n5. Pratos');
            }
        } else {
            state = 'categoria';
            await msg.reply('Escolha uma categoria:\n1. Pizzas\n2. Lanches\n3. Bebidas\n4. Salgados\n5. Pratos');
        }
    
    } else if (state === 'categoria') {
        order.currentCategory = message;
        if (message === '1') {
            state = 'pizza_opcao';
            await msg.reply('Você deseja uma pizza de quantos sabores?\n1. Um sabor\n2. Dois sabores');
        } else if (['2', '3', '4', '5'].includes(message)) {
            // Código existente para outras categorias...
            // [resto do código para outras categorias permanece igual]
        }
    
    } else if (state === 'pizza_opcao') {
        if (message === '1' || message === '2') {
            order.numSabores = parseInt(message);
            state = 'pizza_sabor';
            await msg.reply(`
            *Escolha ${order.numSabores === 1 ? 'o sabor' : 'os sabores'} da pizza:*

1. Presunto     	 (P. R$55 / M. R$65 / G. R$70,00)
2. Calabresa  		 (P. R$55 / M. R$65 / G. R$70,00)
3. Portuguesa		 (P. R$60 / M. R$70 / G. R$75,00)
4. Frango	 	     (P. R$55 / M. R$65 / G. R$70,00)
5. Frango C Catupiry (P. R$60 / M. R$70 / G. R$75,00)
6. Mussarela		 (P. R$50 / M. R$60 / G. R$70,00)	
7. Mista	 		 (P. R$60 / M. R$70 / G. R$75,00)
8. Moda da Casa		 (P. R$60 / M. R$70 / G. R$75,00)
9. Banana  			 (P. R$60 / M. R$70 / G. R$75,00)

${order.numSabores === 2 ? 'Digite os números dos dois sabores separados por vírgula (ex: 1,3)' : 'Digite o número do sabor desejado'}`);
        } else {
            await msg.reply('Por favor, escolha uma opção válida (1 ou 2)');
        }
    
    } else if (state === 'pizza_sabor') {
        const sabores = {
            '1': 'Presunto', '2': 'Calabresa', '3': 'Portuguesa',
            '4': 'Frango', '5': 'Frango C Catupiry', '6': 'Mussarela',
            '7': 'Mista', '8': 'Moda da Casa', '9': 'Banana'
        };

        if (order.numSabores === 2) {
            const escolhidos = message.split(',').map(num => num.trim());
            if (escolhidos.length === 2 && escolhidos.every(num => sabores[num])) {
                order.sabores = escolhidos.map(num => sabores[num]);
                state = 'pizza_tamanho';
                await msg.reply('Escolha o tamanho da pizza:\nP - Pequena\nM - Média\nG - Grande');
            } else {
                await msg.reply('Por favor, escolha dois números válidos separados por vírgula');
            }
        } else {
            if (sabores[message]) {
                order.sabores = [sabores[message]];
                state = 'pizza_tamanho';
                await msg.reply('Escolha o tamanho da pizza:\nP - Pequena\nM - Média\nG - Grande');
            } else {
                await msg.reply('Por favor, escolha um número válido');
            }
        }
    }
        if (state === 'categoria') {
            switch(message) {
                case '2':
                    state = 'item_selecao';
                    order.currentCategory = 'lanche';
                    await msg.reply(`
        *Escolha seu lanche:*
        1. Misto Quente................ R$ 12,00
        2. Misto Quente Duplo.......... R$ 15,00	
    3. Hamburguer.................. R$ 12,00		 
    4. Egg Burguer................. R$ 15,00 	     
    5. Egg Bacon................... R$ 16,00 
    6. Bacon Burguer............... R$ 16,00		 	
    7. X-Burguer................... R$ 15,00	 		 
    8. X-Bacon..................... R$ 17,00
    9. X-Egg....................... R$ 16,00	 
    10. X-Egg Bacon................. R$ 18,00
    11. X-Filé de Peito de Frango... R$ 20,00
    12. X-Tudo...................... R$ 21,00
    13. X-Tudo Filé de Peito........ R$ 24,00`);
                    break;
    
                case '3':
                    state = 'item_selecao';
                    order.currentCategory = 'bebida';
                    await msg.reply(`
    *Escolha sua bebida:*
    1. Água Mineral s/Gás............ R$  3,00
    2. Água Mineral c/Gás............ R$  4,00	
    3. H2O........................... R$  8,00		 
    4. Refrigerante Caçulinha........ R$  3,00 	     
    5. Refrigerante Lata............. R$  7,00 
    6. Refrigerante 600ml............ R$  8,00		 	
    7. Refrigerante 1l............... R$ 10,00	 		 
    8. Refrigerante 2l............... R$ 15,00
    9. Suco mais DelValle............ R$  8,00	 
    10. Suco Garrafa 300ML............ R$ 10,00
    11. Suco Garrafa 500ML............ R$ 15,00
    12. Suco Garrafa 1L............... R$ 20,00
    13. Suco Laranja Natural COPO..... R$ 10,00
    14. Suco Laranja Natural P........ R$ 10,00
    15. Suco Laranja Natural G........ R$ 10,00`);
                    break;
    
                case '4':
                    state = 'item_selecao';
                    order.currentCategory = 'salgado';
                    await msg.reply(`
    *Escolha o Salgado:*
    1. Hamburguer Assado.......... R$ 10,00
    2. Cigarrete.................. R$  8,00
    3. Esfirra.................... R$  8,00
    4. Tortinha de Frango......... R$ 10,00
    5. Joelinho Enrolado.......... R$  8,00
    6. Escondidinho de Frango..... R$  8,00
    7. Enroladinho de Salsicha.... R$  8,00
    8. Coxinha.................... R$  7,00
    9. Kibe....................... R$  7,00
    10. Pastel de Guaraná.......... R$  8,00`);
                    break;
    
                case '5':
                    state = 'item_selecao';
                    order.currentCategory = 'prato';
                    await msg.reply(`
    *Escolha seu Prato ou Porção:*
    1. Fritas com Queijo............................ R$ 40,00
    2. Fritas a Palito.............................. R$ 35,00
    3. Macarrão na Chapa............................ R$ 25,00
    4. Supremo(Arroz branco ou ao alho de Frango)... R$ 80,00
    5. Filé de Tilápia.............................. R$ 65,00
    6. Filé de Tilápia com Fritas................... R$ 70,00`);
                    break;
            }
        }
    
        else if (state === 'item_selecao') {
            const precos = {
                // Lanches
                'Misto Quente': 12, 'Misto Quente Duplo': 15, 'Hamburguer': 12,
                'Egg Burguer': 15, 'Egg Bacon': 16, 'Bacon Burguer': 16,
                'X-Burguer': 15, 'X-Bacon': 17, 'X-Egg': 16,
                'X-Egg Bacon': 18, 'X-Filé de Peito de Frango': 20,
                'X-Tudo': 21, 'X-Tudo Filé de Peito': 24,
                // Bebidas
                'Água Mineral s/Gás': 3, 'Água Mineral c/Gás': 4, 'H2O': 8,
                'Refrigerante Caçulinha': 3, 'Refrigerante Lata': 7,
                'Refrigerante 600ml': 8, 'Refrigerante 1l': 10,
                'Refrigerante 2l': 15, 'Suco mais DelValle': 8,
                'Suco Garrafa 300ML': 10, 'Suco Garrafa 500ML': 15,
                'Suco Garrafa 1L': 20, 'Suco Laranja Natural COPO': 10,
                'Suco Laranja Natural P': 10, 'Suco Laranja Natural G': 10,
                // Salgados
                'Hamburguer Assado': 10, 'Cigarrete': 8, 'Esfirra': 8,
                'Tortinha de Frango': 10, 'Joelinho Enrolado': 8,
                'Escondidinho de Frango': 8, 'Enroladinho de Salsicha': 8,
                'Coxinha': 7, 'Kibe': 7, 'Pastel de Guaraná': 8,
                // Pratos
                'Fritas com Queijo': 40, 'Fritas a Palito': 35,
                'Macarrão na Chapa': 25, 'Supremo': 80,
                'Filé de Tilápia': 65, 'Filé de Tilápia com Fritas': 70
            };
    
            const items = {
                'lanche': {
                    '1': 'Misto Quente', '2': 'Misto Quente Duplo', '3': 'Hamburguer',
                    '4': 'Egg Burguer', '5': 'Egg Bacon', '6': 'Bacon Burguer',
                    '7': 'X-Burguer', '8': 'X-Bacon', '9': 'X-Egg',
                    '10': 'X-Egg Bacon', '11': 'X-Filé de Peito de Frango',
                    '12': 'X-Tudo', '13': 'X-Tudo Filé de Peito'
                },
                'bebida': {
                    '1': 'Água Mineral s/Gás', '2': 'Água Mineral c/Gás', '3': 'H2O',
                    '4': 'Refrigerante Caçulinha', '5': 'Refrigerante Lata',
                    '6': 'Refrigerante 600ml', '7': 'Refrigerante 1l',
                    '8': 'Refrigerante 2l', '9': 'Suco mais DelValle',
                    '10': 'Suco Garrafa 300ML', '11': 'Suco Garrafa 500ML',
                    '12': 'Suco Garrafa 1L', '13': 'Suco Laranja Natural COPO',
                    '14': 'Suco Laranja Natural P', '15': 'Suco Laranja Natural G'
                },
                'salgado': {
                    '1': 'Hamburguer Assado', '2': 'Cigarrete', '3': 'Esfirra',
                    '4': 'Tortinha de Frango', '5': 'Joelinho Enrolado',
                    '6': 'Escondidinho de Frango', '7': 'Enroladinho de Salsicha',
                    '8': 'Coxinha', '9': 'Kibe', '10': 'Pastel de Guaraná'
                },
                'prato': {
                    '1': 'Fritas com Queijo', '2': 'Fritas a Palito',
                    '3': 'Macarrão na Chapa', '4': 'Supremo',
                    '5': 'Filé de Tilápia', '6': 'Filé de Tilápia com Fritas'
                }
            };
    
            const selectedItem = items[order.currentCategory][message];
            if (selectedItem) {
                order.item = selectedItem;
                order.preco = precos[selectedItem];
                state = 'quantidade';
                await msg.reply(`Quantos(as) ${order.item} você deseja?`);
            } else {
                await msg.reply('Por favor, escolha uma opção válida.');
            }
        }
    
        else if (state === 'quantidade') {
            const quantidade = parseInt(message);
            if (!isNaN(quantidade) && quantidade > 0) {
                order.quantidade = quantidade;
                order.items.push({
                    category: order.currentCategory,
                    item: order.item,
                    quantidade: order.quantidade,
                    preco: order.preco
                });
                state = 'mais_itens';
                await msg.reply('Deseja mais alguma coisa? (sim/não)');
            } else {
                await msg.reply('Por favor, digite uma quantidade válida.');
            }
        }
    
        else if (state === 'mais_itens') {
            if (message === 'sim') {
                state = 'categoria';
                await msg.reply(`
    Escolha uma categoria:
    1. Pizzas
    2. Lanches
    3. Bebidas
    4. Salgados
    5. Pratos`);
            } else if (message === 'não') {
                state = 'endereco';
                await msg.reply('Por favor, informe o seu endereço.');
            } else {
                await msg.reply('Por favor, responda com "sim" ou "não".');
            }
        }
    
        else if (state === 'endereco') {
            order.address = msg.body;
            state = 'pagamento';
            await msg.reply('Qual será a forma de pagamento? PIX, Dinheiro ou Cartão?');
        }
    
        else if (state === 'pagamento') {
            if (['pix', 'dinheiro', 'cartão'].includes(message)) {
                order.payment = message;
                if (message === 'dinheiro') {
                    state = 'troco';
                    await msg.reply('Precisa de troco? Para qual valor?');
                } else {
                    state = 'nome';
                    await msg.reply('Por favor, informe o seu nome.');
                }
            } else {
                await msg.reply('Por favor, escolha PIX, Dinheiro ou Cartão.');
            }
        }
    
        else if (state === 'troco') {
            order.change = msg.body;
            state = 'nome';
            await msg.reply('Por favor, informe o seu nome.');
        }
    
        else if (state === 'nome') {
            order.name = msg.body;
            const deliveryFee = 5;
            const totalPrice = order.items.reduce((acc, item) => acc + item.preco * item.quantidade, 0) + deliveryFee;
            const itemsList = order.items.map(item => `${item.quantidade}x ${item.item}`).join('\n');
            state = 'confirmar';
            await msg.reply(`
    *Confirme seu pedido:*
    Nome: ${order.name}
    Endereço: ${order.address}
    Pedido:
    ${itemsList}
    Taxa de entrega: R$ ${deliveryFee.toFixed(2)}
    Total: R$ ${totalPrice.toFixed(2)}
    Forma de pagamento: ${order.payment}${order.change ? ` (Troco para R$ ${order.change})` : ''}
    
    Digite "confirmar" para confirmar o pedido.`);
        }
    
        else if (state === 'confirmar') {
            if (message === 'confirmar') {
                                    await
            };           

               
};


client.initialize();    