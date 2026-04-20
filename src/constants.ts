import { Question, PersonalityData, QuizScores } from './types';

// Avatar base URL from 16 personalities format
const avatarBaseInfo = 'https://static.neris-assets.com/images/personality-types/avatars/';

export const PERSONALITIES: PersonalityData[] = [
  // Analysts (NT) - Purple
  { id: 'intj', nameCn: '建筑师', nameEn: 'Architect', aliasCn: '战略家', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', colorHex: '#9333ea', quoteCn: '并非每个游荡的人都迷了路。', quoteEn: 'Not all those who wander are lost.', descriptionCn: '富有想象力和战略性思维，一切皆在计划之中。', descriptionEn: 'Imaginative and strategic thinkers, with a plan for everything.', avatarUrl: `${avatarBaseInfo}intj-architect.svg` },
  { id: 'intp', nameCn: '逻辑学家', nameEn: 'Logician', aliasCn: '思想家', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', colorHex: '#9333ea', quoteCn: '未经过考察的生活是不值得过的。', quoteEn: 'The unexamined life is not worth living.', descriptionCn: '具有创造力的发明家，对知识有着不可抑制的渴望。', descriptionEn: 'Innovative inventors with an unquenchable thirst for knowledge.', avatarUrl: `${avatarBaseInfo}intp-logician.svg` },
  { id: 'entj', nameCn: '指挥官', nameEn: 'Commander', aliasCn: '大姐头/霸道总裁', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', colorHex: '#9333ea', quoteCn: '你的时间有限，所以不要为别人而活。', quoteEn: 'Your time is limited, so don’t waste it living someone else’s life.', descriptionCn: '大胆、富有想象力、且意志强大的领导者。', descriptionEn: 'Bold, imaginative and strong-willed leaders, always finding a way - or making one.', avatarUrl: `${avatarBaseInfo}entj-commander.svg` },
  { id: 'entp', nameCn: '辩论家', nameEn: 'Debater', aliasCn: '杠精/点子王', category: 'Analyst', colorClass: 'bg-purple-100 text-purple-800', colorHex: '#9333ea', quoteCn: '追随危险的道路——它是通向绝对的确定的唯一途径。', quoteEn: 'Follow the path of the unsafe, independent thinker.', descriptionCn: '聪明好奇的思考者，无法抗拒智力上的挑战。', descriptionEn: 'Smart and curious thinkers who cannot resist an intellectual challenge.', avatarUrl: `${avatarBaseInfo}entp-debater.svg` },
  
  // Diplomats (NF) - Green
  { id: 'infj', nameCn: '提倡者', nameEn: 'Advocate', aliasCn: '老灵魂', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', colorHex: '#16a34a', quoteCn: '每个人都必须决定他们是否要走在光明中。', quoteEn: 'Every man must decide whether he will walk in the light.', descriptionCn: '安静神秘，但非常鼓舞人心且不知疲倦的理想主义者。', descriptionEn: 'Quiet and mystical, yet very inspiring and tireless idealists.', avatarUrl: `${avatarBaseInfo}infj-advocate.svg` },
  { id: 'infp', nameCn: '调停者', nameEn: 'Mediator', aliasCn: '小蝴蝶/忧郁诗人', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', colorHex: '#16a34a', quoteCn: '所有闪光的未必都是金子。', quoteEn: 'All that is gold does not glitter.', descriptionCn: '诗意、善良和无私的人，总是急于帮助正当的理由。', descriptionEn: 'Poetic, kind and altruistic people, always eager to help a good cause.', avatarUrl: `${avatarBaseInfo}infp-mediator.svg` },
  { id: 'enfj', nameCn: '主人公', nameEn: 'Protagonist', aliasCn: '小太阳', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', colorHex: '#16a34a', quoteCn: '只要你愿意，一切都在你心中。', quoteEn: 'Everything you do right now ripples outward and affects everyone.', descriptionCn: '充满魅力和鼓舞人心的领导者，能够让听众着迷。', descriptionEn: 'Charismatic and inspiring leaders, able to mesmerize their listeners.', avatarUrl: `${avatarBaseInfo}enfj-protagonist.svg` },
  { id: 'enfp', nameCn: '竞选者', nameEn: 'Campaigner', aliasCn: '快乐小狗', category: 'Diplomat', colorClass: 'bg-green-100 text-green-800', colorHex: '#16a34a', quoteCn: '并不重要你在哪里，重要的是你要去哪里。', quoteEn: 'It doesn’t interest me what you do for a living.', descriptionCn: '热情、充满活力和社交性的自由精神，总是能找到微笑的理由。', descriptionEn: 'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.', avatarUrl: `${avatarBaseInfo}enfp-campaigner.svg` },
  
  // Sentinels (SJ) - Blue
  { id: 'istj', nameCn: '物流师', nameEn: 'Logistician', aliasCn: '靠谱青年', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', colorHex: '#2563eb', quoteCn: '观察一切：保持你的思想不带偏见。', quoteEn: 'My observation is that whenever one person is found adequate to the discharge of a duty...', descriptionCn: '实用，注重事实的个人，其可靠性不容怀疑。', descriptionEn: 'Practical and fact-minded individuals, whose reliability cannot be doubted.', avatarUrl: `${avatarBaseInfo}istj-logistician.svg` },
  { id: 'isfj', nameCn: '守卫者', nameEn: 'Defender', aliasCn: '贴心小棉袄', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', colorHex: '#2563eb', quoteCn: '爱情只生长在信任里。', quoteEn: 'Love only grows by sharing.', descriptionCn: '极度专注且温暖的人，随时准备保护他们所爱的人。', descriptionEn: 'Very dedicated and warm protectors, always ready to defend their loved ones.', avatarUrl: `${avatarBaseInfo}isfj-defender.svg` },
  { id: 'estj', nameCn: '总经理', nameEn: 'Executive', aliasCn: '大总管', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', colorHex: '#2563eb', quoteCn: '良好的秩序是做事的基础。', quoteEn: 'Good order is the foundation of all things.', descriptionCn: '出色的管理者，擅长管理事情——或是别人。', descriptionEn: 'Excellent administrators, unsurpassed at managing things - or people.', avatarUrl: `${avatarBaseInfo}estj-executive.svg` },
  { id: 'esfj', nameCn: '执政官', nameEn: 'Consul', aliasCn: '人气王', category: 'Sentinel', colorClass: 'bg-blue-100 text-blue-800', colorHex: '#2563eb', quoteCn: '鼓励彼此、建造彼此。', quoteEn: 'Encourage, lift and strengthen one another.', descriptionCn: '非常有爱心，善于交际的人，总是渴望帮助他人。', descriptionEn: 'Extraordinarily caring, social and popular people, always eager to help.', avatarUrl: `${avatarBaseInfo}esfj-consul.svg` },
  
  // Explorers (SP) - Yellow
  { id: 'istp', nameCn: '鉴赏家', nameEn: 'Virtuoso', aliasCn: '硬汉/酷盖', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', colorHex: '#ca8a04', quoteCn: '我本打算过无聊的生活。', quoteEn: 'I wanted to live the life, a different life.', descriptionCn: '大胆且实际的尝试者，熟练于所有类型的工具。', descriptionEn: 'Bold and practical experimenters, masters of all kinds of tools.', avatarUrl: `${avatarBaseInfo}istp-virtuoso.svg` },
  { id: 'isfp', nameCn: '探险家', nameEn: 'Adventurer', aliasCn: '艺术灵魂', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', colorHex: '#ca8a04', quoteCn: '我在一天内改变，我在一分钟内醒来。', quoteEn: 'I change during the course of a day.', descriptionCn: '灵活多变的魅力艺术家，随时准备探索并体验新鲜事物。', descriptionEn: 'Flexible and charming artists, always ready to explore and experience something new.', avatarUrl: `${avatarBaseInfo}isfp-adventurer.svg` },
  { id: 'estp', nameCn: '企业家', nameEn: 'Entrepreneur', aliasCn: '海王/玩家', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', colorHex: '#ca8a04', quoteCn: '人生要么是一场大胆的冒险，要么就什么都不是。', quoteEn: 'Life is either a daring adventure or nothing at all.', descriptionCn: '机智敏捷的风险承担者，总是生活在边缘。', descriptionEn: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge.', avatarUrl: `${avatarBaseInfo}estp-entrepreneur.svg` },
  { id: 'esfp', nameCn: '表演者', nameEn: 'Entertainer', aliasCn: '派对主角', category: 'Explorer', colorClass: 'bg-yellow-100 text-yellow-800', colorHex: '#ca8a04', quoteCn: '不要把生命看得太严肃；无论如何你都不能活着离开。', quoteEn: 'I’m selfish, impatient and a little insecure.', descriptionCn: '随性且精力充沛，和他们在一起永远不会无聊。', descriptionEn: 'Spontaneous, energetic and enthusiastic people - life is never boring around them.', avatarUrl: `${avatarBaseInfo}esfp-entertainer.svg` }
];

export const QUIZ_QUESTIONS: Question[] = [
  // E (Extraversion) / I (Introversion)
  { id: 'q1', textCn: '在社交聚会中，我通常会主动向不认识的人自我介绍。', textEn: 'At a social gathering, I usually initiate conversations with strangers.', dimension: 'E/I', direction: 1 },
  { id: 'q2', textCn: '经过充实的一周工作后，呆在家里比出去社交更让我放松。', textEn: 'After an exhausting week, staying at home is much more relaxing than going out.', dimension: 'E/I', direction: -1 },
  { id: 'q3', textCn: '我对需要迅速反应或临场发言感到自在。', textEn: 'I feel comfortable making spontaneous remarks or speaking without preparation.', dimension: 'E/I', direction: 1 },

  // S (Sensing) / N (Intuition)
  { id: 'q4', textCn: '与其讨论一些抽象的理论，我更喜欢讨论实际有用的技巧。', textEn: 'I prefer practical skills over abstract theories.', dimension: 'S/N', direction: 1 },
  { id: 'q5', textCn: '我经常花时间思考未来可能发生的各种假设。', textEn: 'I often spend time contemplating various scenarios that might happen in the future.', dimension: 'S/N', direction: -1 },
  { id: 'q6', textCn: '我更倾向于相信具体的经验和数据，而非预感。', textEn: 'I trust concrete experiences and data more than hunches.', dimension: 'S/N', direction: 1 },

  // T (Thinking) / F (Feeling)
  { id: 'q7', textCn: '做决定时，我认为公平公正比是否照顾到别人的情绪更重要。', textEn: 'When making decisions, fairness and objective criteria are more important than keeping everyone happy.', dimension: 'T/F', direction: 1 },
  { id: 'q8', textCn: '如果身边有人难过，我会很容易被他们的情绪感染并同情他们。', textEn: 'If someone is sad, I easily absorb their emotions and sympathize deeply.', dimension: 'T/F', direction: -1 },
  { id: 'q9', textCn: '在辩论中，输赢比维持良好的氛围更能激发我的动力。', textEn: 'In a debate, winning or finding the truth motivates me more than maintaining harmony.', dimension: 'T/F', direction: 1 },

  // J (Judging) / P (Perceiving)
  { id: 'q10', textCn: '我喜欢提前规划好行程和任务清单，按部就班地完成。', textEn: 'I enjoy planning out schedules and tasks in advance and sticking to them.', dimension: 'J/P', direction: 1 },
  { id: 'q11', textCn: '我不喜欢死板的计划，更喜欢根据当下的心情和情况来做决定。', textEn: 'I dislike rigid plans; I prefer to decide things based on my current mood and circumstances.', dimension: 'J/P', direction: -1 },
  { id: 'q12', textCn: '完成一个任务并在清单上打勾，给我带来极大的满足感。', textEn: 'Completing a task and checking it off gives me great satisfaction.', dimension: 'J/P', direction: 1 },

  // A (Assertive) / Tu (Turbulent)
  { id: 'q13', textCn: '我很少怀疑自己做出的决定是否正确。', textEn: 'I rarely second-guess the choices that I have made.', dimension: 'A/Tu', direction: 1 },
  { id: 'q14', textCn: '我很容易感到压力，并担心事情会出现糟糕的发展。', textEn: 'I easily feel stressed and worry that things will take a turn for the worse.', dimension: 'A/Tu', direction: -1 },
  { id: 'q15', textCn: '在大多数情况下，我对自己的能力和表现充满自信。', textEn: 'In most situations, I am deeply confident in my abilities and performance.', dimension: 'A/Tu', direction: 1 },
];

export const INITIAL_SCORES: QuizScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0, A: 0, Tu: 0 };
