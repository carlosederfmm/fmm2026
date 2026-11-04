(function () {
    const rules = {
        'Básica': {
            P1: { Regular: { q: 20, p: 0.4 }, Adaptada: { q: 15, p: 0.5 } },
            RC: { Regular: { q: 25, p: 0.4 }, Adaptada: { q: 20, p: 0.5 } },
            P2: { Regular: { q: 25, p: 0.4 }, Adaptada: { q: 20, p: 0.5 } },
            'P1 - 2ª CHAMADA': { Regular: { q: 20, p: 0.4 }, Adaptada: { q: 15, p: 0.5 } },
            'P2 - 2ª CHAMADA': { Regular: { q: 25, p: 0.4 }, Adaptada: { q: 20, p: 0.5 } }
        },
        'Técnica': {
            P1: { Regular: { q: 20, p: 0.5 }, Adaptada: { q: 15, p: 0.6667 } },
            RC: { Regular: { q: 10, p: 1.0 }, Adaptada: { q: 5, p: 2.0 } },
            'P1 - 2ª CHAMADA': { Regular: { q: 20, p: 0.5 }, Adaptada: { q: 15, p: 0.6667 } },
            'P2 - 2ª CHAMADA': { Regular: { q: 20, p: 0.5 }, Adaptada: { q: 15, p: 0.6667 } },
            '2ª CHAMADA': { Regular: { q: 20, p: 0.5 }, Adaptada: { q: 15, p: 0.6667 } }
        },
        Fundamental: {
            Lower: { Regular: { q: 15, p: 0.5 }, Adaptada: { q: 10, p: 0.6667 } },
            Upper: { Regular: { q: 20, p: 0.4 }, Adaptada: { q: 15, p: 0.5 } }
        }
    };

    function normalizeType(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[ºª]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();
    }

    function getRule(matriz, serie, tipo, modalidade, configuration = null) {
        const normalizedTipo = normalizeType(tipo);
        let rule;

        if (matriz === 'Fundamental') {
            const group = ['5º Ano', '6º Ano', '7º Ano'].includes(serie) ? 'Lower' : 'Upper';
            rule = rules.Fundamental[group][modalidade];
        } else {
            const matrixRules = rules[matriz];
            if (!matrixRules) return null;

            const matchedType = Object.keys(matrixRules).find(ruleType =>
                normalizeType(ruleType) === (normalizedTipo === 'REC' ? 'RC' : normalizedTipo)
            );
            rule = matrixRules[matchedType]?.[modalidade];

            if (!rule && normalizedTipo.includes('CHAMADA')) {
                const baseType = normalizedTipo.includes('P2') ? 'P2' : 'P1';
                rule = matrixRules[baseType]?.[modalidade];
            }
        }

        if (!rule) return null;

        return {
            ...rule,
            q: configuration?.qtd_questoes_objetivas ?? rule.q,
            p: Number(configuration?.valor_ponto ?? rule.p)
        };
    }

    window.GabaritoRules = { getRule };
})();
