const produtos = {
arroz: { nome: "Arroz", preco: 25 },
  feijao: { nome: "Feijão", preco: 8 },
  leite: { nome: "Leite", preco: 6 },
  pao: { nome: "Pão", preco: 9 },
  maca: { nome: "Maçã", preco: 7 },
  ovos: { nome: "Ovos", preco: 15 }
};

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ erro: "Método não permitido" }),
      { status: 405 }
    );
  }

  try {
    const dados = await request.json();

    const nome = String(dados.nome || "").trim();
    const endereco = String(dados.endereco || "").trim();

    if (nome.length < 2 || endereco.length < 5) {
      return new Response(
        JSON.stringify({ erro: "Preencha nome e endereço." }),
        { status: 400 }
      );
    }

    if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
      return new Response(
        JSON.stringify({ erro: "Carrinho vazio." }),
        { status: 400 }
      );
    }

    const itens = dados.itens.map(item => {
      const produto = produtos[item.id];
      const quantidade = Number(item.quantidade);

      if (!produto ||
          !Number.isInteger(quantidade) ||
          quantidade < 1 ||
          quantidade > 30) {
        throw new Error("Produto ou quantidade inválida.");
      }

      return {
        nome: produto.nome,
        quantidade,
        subtotal: produto.preco * quantidade
      };
    });

    const total = itens.reduce(
      (soma, item) => soma + item.subtotal, 0
    );

    const pedido = {
      numero: crypto.randomUUID(),
      nome,
      endereco,
      itens,
      total,
      status: "Aguardando confirmação",
      pagamento: "Pix"
    };

    return new Response(
      JSON.stringify({
        mensagem: "Pedido recebido!",
        pedido
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (erro) {
    return new Response(
      JSON.stringify({ erro: "Não foi possível processar o pedido." }),
      { status: 400 }
    );
  }
};
