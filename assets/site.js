// ---------- Entradas ----------
document.querySelectorAll('.hero .nome span').forEach((letra, i) => letra.style.setProperty('--i', i));
document.querySelectorAll('section').forEach((secao) => {
  secao.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--atraso', `${Math.min(i, 6) * 75}ms`);
  });
});

const alvos = document.querySelectorAll('[data-reveal]');
const mostrar = (el) => el.classList.add('visivel');

if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      mostrar(entrada.target);
      observador.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  alvos.forEach((el) => observador.observe(el));
} else {
  alvos.forEach(mostrar);
}

// ---------- Carrosséis de telas ----------
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SETAS = {
  anterior: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M13 3 6 10l7 7"/></svg>',
  proxima: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m7 3 7 7-7 7"/></svg>',
};

function criarBotao(classe, rotulo, conteudo = '') {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = classe;
  botao.setAttribute('aria-label', rotulo);
  botao.innerHTML = conteudo;
  return botao;
}

function montarCarrossel(carrossel) {
  const trilho = carrossel.querySelector('.trilho');
  const telas = [...trilho.children];
  const nome = carrossel.getAttribute('aria-label').toLowerCase();
  const marcadores = document.createElement('div');
  marcadores.className = 'marcadores';
  let atual = 0;
  let quadroPendente = false;

  const marcar = (indice) => {
    atual = indice;
    [...marcadores.children].forEach((marcador, i) => marcador.setAttribute('aria-current', i === indice));
  };

  const ir = (indice, behavior = reduzMovimento ? 'auto' : 'smooth') => {
    const alvo = (indice + telas.length) % telas.length;
    trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior });
    marcar(alvo);
  };

  const anterior = criarBotao('seta seta-anterior', `Tela anterior: ${nome}`, SETAS.anterior);
  const proxima = criarBotao('seta seta-proxima', `Próxima tela: ${nome}`, SETAS.proxima);
  anterior.addEventListener('click', () => ir(atual - 1));
  proxima.addEventListener('click', () => ir(atual + 1));

  telas.forEach((_, i) => {
    const marcador = criarBotao('', `Mostrar tela ${i + 1} de ${telas.length}`);
    marcador.addEventListener('click', () => ir(i));
    marcadores.append(marcador);
  });

  carrossel.append(anterior, proxima, marcadores);
  marcar(0);

  // Quem desliza com o dedo também atualiza os marcadores.
  trilho.addEventListener('scroll', () => {
    if (quadroPendente) return;
    quadroPendente = true;
    requestAnimationFrame(() => {
      quadroPendente = false;
      const indice = Math.round(trilho.scrollLeft / trilho.clientWidth);
      if (indice !== atual) marcar(indice);
    });
  }, { passive: true });

  return { carrossel, realinhar: () => ir(atual, 'auto') };
}

const carrosseis = [...document.querySelectorAll('.carrossel')].map(montarCarrossel);
addEventListener('resize', () => carrosseis.forEach(({ realinhar }) => realinhar()));
