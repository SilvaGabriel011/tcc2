1\. Introdução

A pecuária de corte brasileira representa um dos pilares do agronegócio nacional, contribuindo significativamente para o Produto Interno Bruto (PIB) agropecuário e para as exportações do país (IBGE, 2023). O Brasil ocupa posição de destaque mundial na produção e comercialização de carne bovina, resultado de um sistema produtivo diversificado que combina tecnologias avançadas de manejo, nutrição e melhoramento genético com práticas tradicionais de criação (EMBRAPA, 2022; FAO, 2024). Entretanto, a formação do preço do gado gordo é influenciada por um conjunto complexo de fatores biológicos, zootécnicos, econômicos e ambientais que variam de acordo com raça, categoria animal, peso, período do ano e região geográfica (CEPEA/ESALQ-USP, 2023).

Nesse contexto, o uso de métodos estatísticos torna-se fundamental para compreender e quantificar a influência dessas variáveis sobre o valor de mercado dos animais. A análise estatística permite identificar diferenças significativas entre grupos e orientar decisões estratégicas relacionadas à compra, venda e planejamento de produção. Entre as técnicas mais utilizadas, a análise de Variância (ANOVA) destaca-se por possibilitar a comparação de médias entre múltiplos grupos de forma eficiente e interpretável, sendo amplamente aplicada em pesquisas zootécnicas e econômicas (BUSSAB & MORETTIN, 2017; TRIOLA, 2022).

Com o avanço das tecnologias de informação, novas ferramentas computacionais têm ampliado o acesso a análises estatísticas no campo. Linguagens como Python, associadas a bibliotecas livres como _pandas_, _numpy_, _matplotlib_ e _scipy_, permitem o desenvolvimento de aplicações interativas e acessíveis (MCKINNEY, 2018; VANDERPLAS, 2016). Além disso, o crescimento exponencial da Inteligência Artificial (IA) e dos assistentes de programação baseados em linguagem natural tem revolucionado o modo como aplicativos são criados. Plataformas de IA generativa como ChatGPT, Gemini, Copilot e Cursor permitem que usuários descrevam problemas e obtenham automaticamente códigos, interfaces e análises complexas sem a necessidade de profundo conhecimento técnico em programação (RUSSELL & NORVIG, 2021; GOODFELLOW et al., 2016).

Essa democratização tecnológica amplia o alcance da computação aplicada, permitindo que profissionais de diferentes áreas como a zootecnia, medicina veterinária e administração rural desenvolvam e personalizem soluções para seus contextos de trabalho. Assim, a IA não apenas acelera o desenvolvimento de aplicativos como também atua como mediadora entre o conhecimento técnico e o domínio prático, reduzindo barreiras de entrada e promovendo inovação interdisciplinar (ZHANG et al., 2023).

Neste cenário, surge o Tio ZooEstatístico, um aplicativo desenvolvido em Python com o framework Streamlit, projetado para automatizar o processo de análise estatística de dados de mercado de bovinos. O sistema possibilita o upload e limpeza de planilhas, execução de testes estatísticos incluindo ANOVA e geração automática de relatórios interpretativos (BUSSAB; MORETTIN, 2017; MONTGOMERY, 2017; SEABOLD; PERKTOLD, 2010). A implementação baseia-se em um ecossistema consolidado de bibliotecas abertas para ciência de dados e computação numérica, como pandas, NumPy, SciPy, Matplotlib e Statsmodels, que dão suporte a rotinas de preparação, modelagem e visualização (MCKINNEY, 2018; HARRIS et al., 2020; VIRTANEN et al., 2020; HUNTER, 2007; SEABOLD; PERKTOLD, 2010), além do Streamlit para a interface web interativa (STREAMLIT, 2022). Sua concepção foi fortemente influenciada pelo uso de ferramentas de IA assistiva, que otimizaram a escrita de código, a documentação e a prototipação de interface, reduzindo barreiras técnicas e tornando o desenvolvimento mais ágil, colaborativo e acessível (GOODFELLOW; BENGIO; COURVILLE, 2016; RUSSELL; NORVIG, 2021; CHEN et al., 2021).

Assim, o presente trabalho tem como objetivo principal apresentar o desenvolvimento e a aplicação prática do aplicativo Tio ZooEstatístico, destacando sua relevância como ferramenta de apoio à tomada de decisão no setor pecuário. De maneira complementar, busca-se demonstrar a importância da integração entre ciência de dados, estatística aplicada, inteligência artificial e zootecnia, promovendo uma abordagem inovadora, replicável e acessível à análise de informações no agronegócio brasileiro.

2\. Revisão de Literatura

A pecuária de corte no Brasil tem sido amplamente estudada por sua importância econômica, social e ambiental, consolidando-se como um dos principais setores do agronegócio (IBGE, 2023; EMBRAPA, 2022). O país figura entre os maiores produtores e exportadores de carne bovina do mundo, com destaque para o avanço tecnológico na nutrição, genética e gestão de rebanhos (FAO, 2024; CEPEA/ESALQ-USP, 2023). O preço do gado de corte é resultado de uma interação complexa entre oferta, demanda, custos de produção, sazonalidade e características zootécnicas dos animais, como raça, categoria e peso (ANUALPEC, 2023; CEPEA/ESALQ-USP, 2023). A análise adequada dessas variáveis é essencial para compreender os mecanismos de formação de preço e subsidiar políticas e estratégias de manejo mais eficientes.

Do ponto de vista estatístico, o uso de métodos quantitativos é indispensável para identificar padrões, avaliar correlações e estimar a significância de fatores que influenciam o desempenho e a rentabilidade na pecuária. A Análise de Variância (ANOVA) destaca-se como técnica central para a comparação de médias entre múltiplos grupos, permitindo avaliar a influência de variáveis categóricas como raça ou estado sobre variáveis contínuas de interesse, como o preço por quilograma de peso vivo (BUSSAB; MORETTIN, 2017; TRIOLA, 2022). Além de sua robustez teórica, a ANOVA possui aplicabilidade prática, oferecendo uma forma objetiva de detectar diferenças estatisticamente significativas em contextos com grande variabilidade biológica e econômica (MONTGOMERY, 2017).

Com a evolução da ciência de dados, as ferramentas digitais transformaram a forma de realizar e interpretar análises estatísticas. A linguagem Python, combinada a bibliotecas como _pandas_, _NumPy_, _Matplotlib_ e _SciPy_, tornou-se referência para manipulação, visualização e modelagem de dados científicos (MCKINNEY, 2018; VIRTANEN et al., 2020; HUNTER, 2007). O uso dessas ferramentas, aliado a frameworks como o Streamlit, democratizou o acesso à estatística aplicada, permitindo que profissionais de áreas não técnicas construam aplicações personalizadas capazes de processar, visualizar e interpretar resultados de maneira intuitiva (STREAMLIT, 2022). Essa possibilidade de transformar análises em interfaces visuais facilita o entendimento dos resultados por equipes multidisciplinares, promovendo a tomada de decisão baseada em evidências.

Nos últimos anos, a Inteligência Artificial (IA) emergiu como um agente transformador nesse ecossistema, ampliando o alcance da automação e reduzindo a necessidade de conhecimento técnico especializado. Ferramentas de assistência de código e modelos de linguagem natural como ChatGPT, Copilot e Cursor têm acelerado o desenvolvimento de software científico e de aplicações analíticas, permitindo que pesquisadores concentrem esforços na interpretação dos dados, e não nas etapas de codificação (GOODFELLOW; BENGIO; COURVILLE, 2016; RUSSELL; NORVIG, 2021; CHEN et al., 2021). Essa convergência entre estatística, programação e IA representa um avanço decisivo para a zootecnia moderna, ao viabilizar análises reprodutíveis, interfaces acessíveis e a exploração de grandes volumes de dados de forma inteligente e autônoma.

3\. Materiais e Métodos

Os dados utilizados neste estudo foram obtidos durante o estágio obrigatório do autor na Agrofintech Leilo App, plataforma voltada ao acompanhamento e análise de mercados pecuários. A base primária consiste em planilhas internas de monitoramento de gado magro e gordo, contendo variáveis temporais (ano, trimestre), espaciais (estado de origem), categóricas (raça, categoria animal, tipo de gado) e numéricas (peso vivo, valor de negociação e preço por quilograma). Os dados foram disponibilizados em formato .xlsx e, para fins de pesquisa, passaram por um protocolo de limpeza e padronização, contemplando: (i) checagem de duplicidades; (ii) tratamento de ausências (NA) e inconsistências; (iii) uniformização de unidades de medida e nomenclaturas (p. ex., codificação de raças/UF); e (iv) derivação de variáveis quando necessário (p. ex., cálculo de preço/kg a partir de valor/peso). Esse fluxo visou garantir reprodutibilidade e rastreabilidade das etapas analíticas.

A análise estatística, adotada pelo aplicativo, foi a Análise de Variância (ANOVA) de uma via, tendo o preço por quilograma como variável resposta e a raça como fator de agrupamento. O objetivo foi testar a hipótese nula de igualdade de médias de preço entre raças sob nível de significância de 5% (p \< 0,05). Em linha com boas práticas, o procedimento considerou: (a) inspeção descritiva e gráfica prévia; (b) avaliação dos pressupostos usuais da ANOVA (normalidade dos resíduos e homocedasticidade, de forma exploratória); e (c) indicação de testes pós-hoc (p. ex., Tukey HSD) para identificação de pares de grupos com diferenças significativas, caso a hipótese nula fosse rejeitada (BUSSAB; MORETTIN, 2017; MONTGOMERY, 2017; TRIOLA, 2022).

Todas as rotinas foram implementadas em Python, com uso das bibliotecas pandas (organização e transformação de dados), NumPy (cálculo numérico), SciPy/Statsmodels (testes e modelos estatísticos) e Matplotlib/Plotly (visualização), reconhecidas pela robustez e transparência de seus algoritmos (MCKINNEY, 2018; VIRTANEN et al., 2020; SEABOLD; PERKTOLD, 2010; HUNTER, 2007). A aplicação Tio ZooEstatístico foi desenvolvida em Streamlit, permitindo upload de planilhas, execução automatizada de análises (estatística descritiva, ANOVA e, quando pertinente, pós-hoc), além de exportação dos resultados em .csv, .xlsx e .pdf (STREAMLIT, 2022). O sistema incorpora ainda recursos de IA assistiva para interpretação textual dos resultados e sugestões de próximos passos analíticos, reduzindo a barreira técnica e democratizando o uso de métodos estatísticos por profissionais não especialistas (RUSSELL; NORVIG, 2021; CHEN et al., 2021).

Para padronizar a apresentação dos resultados e facilitar a leitura no corpo do trabalho, prevê-se a inclusão das seguintes estruturas (a serem preenchidas na seção de Resultados): Tabela 1 – Estatísticas descritivas do preço/kg por raça (contagem, média, desvio-padrão, mínimo, máximo) e Tabela 2 – ANOVA (uma via) para preço/kg por raça. Complementarmente, serão inseridas Figura 1 – Histograma do preço/kg, Figura 2 – Boxplot do preço/kg por raça e Figura 3 – Dispersão Peso (kg) × Preço/kg, compondo um painel visual que apoia a interpretação econômica e zootécnica dos achados. Essa preparação antecipa a integração entre o texto analítico e os sumários tabulares/gráficos, favorecendo a comunicação com públicos técnicos e gerenciais.

Fonte dos dados: planilhas internas de mercado disponibilizadas pela Leilo App ao autor durante o estágio obrigatório, utilizadas exclusivamente para fins acadêmicos e de pesquisa aplicada, obedecendo a princípios de confidencialidade e uso responsável.

X. Referências

BUSSAB, W. O.; MORETTIN, P. A. _Estatística Básica_. 9\. ed. São Paulo: Saraiva, 2017\.

CHEN, M. _et al._ _Evaluating Large Language Models Trained on Code_. arXiv:2107.03374, 2021\.

HUNTER, J. D. _Matplotlib: A 2D Graphics Environment_. _Computing in Science & Engineering_, v. 9, n. 3, p. 90–95, 2007\.

MCKINNEY, W. _Python for Data Analysis_. 2\. ed. O’Reilly, 2018\.

MONTGOMERY, D. C. _Design and Analysis of Experiments_. 9\. ed. Wiley, 2017\.

RUSSELL, S.; NORVIG, P. _Artificial Intelligence: A Modern Approach_. 4\. ed. Pearson, 2021\.

SEABOLD, S.; PERKTOLD, J. _Statsmodels: Econometric and Statistical Modeling with Python_. Proc. 9th PyData/SciPy, 2010\.

STREAMLIT. _Streamlit Documentation_. 2022\. Disponível em: docs.streamlit.io.

TRIOLA, M. F. _Introdução à Estatística_. 13\. ed. LTC, 2022\.

VIRTANEN, P. _et al._ _SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python_. _Nature Methods_, 2020\.

ANUALPEC. _Anuário da Pecuária Brasileira_. São Paulo: Instituto FNP, 2023\.

BUSSAB, W. O.; MORETTIN, P. A. _Estatística Básica_. 9\. ed. São Paulo: Saraiva, 2017\.  
CEPEA/ESALQ-USP. _Indicadores do mercado de boi gordo_. Piracicaba, 2023\.

CHEN, M. _et al._ _Evaluating Large Language Models Trained on Code_. arXiv:2107.03374, 2021\.

EMBRAPA. _Pecuária de Corte: Relatórios Técnicos_. Brasília, 2022\.

FAO. _Meat Market Review_. Roma: Food and Agriculture Organization, 2024\.

GOODFELLOW, I.; BENGIO, Y.; COURVILLE, A. _Deep Learning_. Cambridge, MA: MIT Press, 2016\.  
HUNTER, J. D. _Matplotlib: A 2D Graphics Environment_. _Computing in Science & Engineering_, v. 9, n. 3, p. 90–95, 2007\.  
IBGE. _Produção da Pecuária Municipal_. Rio de Janeiro, 2023\.

MCKINNEY, W. _Python for Data Analysis_. 2\. ed. O’Reilly, 2018\.

MONTGOMERY, D. C. _Design and Analysis of Experiments_. 9\. ed. Wiley, 2017\.

RUSSELL, S.; NORVIG, P. _Artificial Intelligence: A Modern Approach_. 4\. ed. Pearson, 2021\.

STREAMLIT. _Streamlit Documentation_. 2022\. Disponível em: https://docs.streamlit.io.

TRIOLA, M. F. _Introdução à Estatística_. 13\. ed. Rio de Janeiro: LTC, 2022\.

VIRTANEN, P. _et al._ _SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python_. _Nature Methods_, v. 17, p. 261–272, 2020\.
