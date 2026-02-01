
import { GoogleGenAI } from "@google/genai";
import { Player } from "../types";

export const getTeamInsights = async (players: Player[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const playersData = players.map(p => ({
    nome: p.name,
    gols: p.goals,
    jogos: p.games,
    posicao: p.position,
    pagou_este_mes: p.paymentHistory?.includes(currentMonth) ? 'Sim' : 'Não',
    meses_pagos_ano: p.paymentHistory?.length || 0
  }));

  const prompt = `Analise os dados do time DESINTROSADOS FC e forneça um relatório técnico e financeiro.
  
  Dados do Elenco: ${JSON.stringify(playersData)}
  
  REGRAS DE FORMATAÇÃO:
  1. Responda em exatamente 5 tópicos curtos (bullet points iniciados com "-").
  2. Cada tópico deve ter no máximo 15 palavras.
  3. NÃO use caracteres especiais, emojis ou símbolos.
  4. O texto deve ser limpo e direto.
  
  CONTEÚDO DO RELATÓRIO:
  - Destaque artilheiros.
  - Classifique os pagadores (Bronze, Prata ou Ouro). 
  - Situação financeira do mês atual.
  - Motivação para os inadimplentes.
  - Frase final de comando.
  
  Use tom de vestiário de futebol amador.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights:", error);
    return "O Coach IA esta temporariamente fora do vestiario. Tente novamente em instantes.";
  }
};
