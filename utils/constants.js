module.exports = {
  PERSONALITIES: [
    { id: 'intj', nameCn: '建筑师', nameEn: 'Architect', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/intj-architect.svg' },
    { id: 'intp', nameCn: '逻辑学家', nameEn: 'Logician', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/intp-logician.svg' },
    { id: 'entj', nameCn: '指挥官', nameEn: 'Commander', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/entj-commander.svg' },
    { id: 'entp', nameCn: '辩论家', nameEn: 'Debater', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/entp-debater.svg' },
    { id: 'infj', nameCn: '提倡者', nameEn: 'Advocate', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/infj-advocate.svg' },
    { id: 'infp', nameCn: '调停者', nameEn: 'Mediator', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/infp-mediator.svg' },
    { id: 'enfj', nameCn: '主人公', nameEn: 'Protagonist', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/enfj-protagonist.svg' },
    { id: 'enfp', nameCn: '竞选者', nameEn: 'Campaigner', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/enfp-campaigner.svg' },
    { id: 'istj', nameCn: '物流师', nameEn: 'Logistician', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/istj-logistician.svg' },
    { id: 'isfj', nameCn: '守卫者', nameEn: 'Defender', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/isfj-defender.svg' },
    { id: 'estj', nameCn: '总经理', nameEn: 'Executive', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/estj-executive.svg' },
    { id: 'esfj', nameCn: '执政官', nameEn: 'Consul', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/esfj-consul.svg' },
    { id: 'istp', nameCn: '鉴赏家', nameEn: 'Virtuoso', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/istp-virtuoso.svg' },
    { id: 'isfp', nameCn: '探险家', nameEn: 'Adventurer', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/isfp-adventurer.svg' },
    { id: 'estp', nameCn: '企业家', nameEn: 'Entrepreneur', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/estp-entrepreneur.svg' },
    { id: 'esfp', nameCn: '表演者', nameEn: 'Entertainer', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', avatarUrl: 'https://static.neris-assets.com/images/personality-types/avatars/esfp-entertainer.svg' }
  ],
  QUIZ_QUESTIONS: [
    { id: 'q1', textCn: '在社交聚会中，我通常会主动向不认识的人自我介绍。', textEn: 'At a social gathering, I usually initiate conversations with strangers.', dimension: 'E/I', direction: 1 },
    { id: 'q2', textCn: '经过充实的一周工作后，呆在家里比出去社交更让我放松。', textEn: 'After an exhausting week, staying at home is much more relaxing than going out.', dimension: 'E/I', direction: -1 },
    { id: 'q3', textCn: '我对需要迅速反应或临场发言感到自在。', textEn: 'I feel comfortable making spontaneous remarks or speaking without preparation.', dimension: 'E/I', direction: 1 },
    { id: 'q4', textCn: '与其讨论一些抽象的理论，我更喜欢讨论实际有用的技巧。', textEn: 'I prefer practical skills over abstract theories.', dimension: 'S/N', direction: 1 },
    { id: 'q5', textCn: '我经常花时间思考未来可能发生的各种假设。', textEn: 'I often spend time contemplating various scenarios that might happen in the future.', dimension: 'S/N', direction: -1 },
    { id: 'q6', textCn: '我更倾向于相信具体的经验和数据，而非预感。', textEn: 'I trust concrete experiences and data more than hunches.', dimension: 'S/N', direction: 1 },
    { id: 'q7', textCn: '做决定时，我认为公平公正比是否照顾到别人的情绪更重要。', textEn: 'When making decisions, fairness and objective criteria are more important than keeping everyone happy.', dimension: 'T/F', direction: 1 },
    { id: 'q8', textCn: '如果身边有人难过，我会很容易被他们的情绪感染并同情他们。', textEn: 'If someone is sad, I easily absorb their emotions and sympathize deeply.', dimension: 'T/F', direction: -1 },
    { id: 'q9', textCn: '在辩论中，输赢比维持良好的氛围更能激发我的动力。', textEn: 'In a debate, winning or finding the truth motivates me more than maintaining harmony.', dimension: 'T/F', direction: 1 },
    { id: 'q10', textCn: '我喜欢提前规划好行程和任务清单，按部就班地完成。', textEn: 'I enjoy planning out schedules and tasks in advance and sticking to them.', dimension: 'J/P', direction: 1 },
    { id: 'q11', textCn: '我不喜欢死板的计划，更喜欢根据当下的心情和情况来做决定。', textEn: 'I dislike rigid plans; I prefer to decide things based on my current mood and circumstances.', dimension: 'J/P', direction: -1 },
    { id: 'q12', textCn: '完成一个任务并在清单上打勾，给我带来极大的满足感。', textEn: 'Completing a task and checking it off gives me great satisfaction.', dimension: 'J/P', direction: 1 },
    { id: 'q13', textCn: '我很少怀疑自己做出的决定是否正确。', textEn: 'I rarely second-guess the choices that I have made.', dimension: 'A/Tu', direction: 1 },
    { id: 'q14', textCn: '我很容易感到压力，并担心事情会出现糟糕的发展。', textEn: 'I easily feel stressed and worry that things will take a turn for the worse.', dimension: 'A/Tu', direction: -1 },
    { id: 'q15', textCn: '在大多数情况下，我对自己的能力和表现充满自信。', textEn: 'In most situations, I am deeply confident in my abilities and performance.', dimension: 'A/Tu', direction: 1 }
  ]
};
