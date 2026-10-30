// 扭蛋台词池。全部原创，仿物语系列的语感。
// MOODS 与三种语言的 common 数组一一对应（同一句的译文共享同一个情绪）。
// 情绪决定卡片上的文字色与边框色：
//   daily 日常 / self 自嘲 / sharp 锐利 / gentle 温柔 / rare 稀有

export const MOODS = [
  'self', 'sharp', 'sharp', 'daily', 'gentle',
  'daily', 'sharp', 'self', 'gentle', 'self',
  'daily', 'sharp', 'self', 'sharp', 'gentle',
  'gentle', 'daily', 'self', 'sharp', 'daily',
];

export const gacha = {
  zh: {
    common: [
      '今天也什么都没做成，并且对此感到骄傲。',
      '人这种生物，最擅长把今天的疲惫包装成明天的话题。',
      '我讨厌两件事：一是解释，二是被解释。',
      '沉默不是没有话说，是话太多，懒得挑。',
      '你不是懒，你只是把「开始」这件事留给了明天的自己。',
      '所谓成熟，就是学会在电梯里假装看手机。',
      '世界不会因为你难过就停下来，但它会因为你难过而变得更吵。',
      '我最近唯一坚持下来的事，是没有放弃放弃。',
      '你可以不优秀，但不能不诚实——尤其对自己。',
      '有些人活着是为了留下痕迹，我活着是为了不留下早餐的痕迹。',
      '别急着理解世界，世界还没理解你。',
      '努力不一定有回报，但至少能让你的借口显得更精致。',
      '深夜适合思考人生，也适合把人生想得比实际更糟。',
      '我不怕孤独，我怕的是孤独的时候有人敲门。',
      '真正的自由，是敢于让别人失望。',
      '你的人生不需要观众，但你需要一个不催你的钟。',
      '所谓「下次一定」，是成年人之间最温柔的谎言。',
      '如果今天是最后一天，我大概还是会先刷十分钟手机。',
      '我们都在假装自己很忙，忙着假装。',
      '别把沉默当成答案，它只是还没想好怎么拒绝你。',
    ],
    rare: ['你已经在做比你以为的更多的事了。', '这次，是真的可以。', '今天这样就够了。'],
  },
  ja: {
    common: [
      '今日も何もできなかった。そして、それを誇りに思っている。',
      '人間という生き物は、今日の疲れを明日の話題に包み直すのが一番得意だ。',
      '嫌いなものが二つある。説明することと、説明されることだ。',
      '沈黙は言葉がないんじゃない。多すぎて、選ぶのが面倒なだけだ。',
      '君は怠けているんじゃない。「始める」を明日の自分に預けているだけだ。',
      '大人になるというのは、エレベーターでスマホを見ているふりを覚えることだ。',
      '世界は君が悲しいから止まってはくれない。ただ、もっと騒がしくなるだけだ。',
      '最近続けられている唯一のこと、それは「諦めるのを諦めない」ことだ。',
      '優秀でなくてもいい。でも不誠実ではいけない。特に自分に対しては。',
      '痕跡を残すために生きる人もいる。僕は朝食の痕跡を残さないために生きている。',
      '世界を理解しようと焦るな。世界はまだ君を理解していない。',
      '努力が報われるとは限らない。少なくとも言い訳は上品になる。',
      '深夜は人生を考えるのに向いている。人生を実際より悪く考えるのにも向いている。',
      '孤独は怖くない。怖いのは、孤独なときに誰かがノックすることだ。',
      '本当の自由とは、誰かを失望させる勇気を持つことだ。',
      '人生に観客は要らない。要るのは、急かさない時計だ。',
      '「今度こそ」は、大人同士の一番優しい嘘だ。',
      '今日が最後の日なら、たぶん最初に十分だけスマホを見る。',
      '僕らはみんな忙しいふりをしている。忙しいふりをすることで。',
      '沈黙を答えだと思うな。まだ断り方を考えているだけだ。',
    ],
    rare: ['君はもう、自分が思っているより多くのことをしている。', '今度は、本当に行ける。', '今日の君は、今日のままでいい。'],
  },
  en: {
    common: [
      'Did nothing today. Proud of it, actually.',
      "Humans are best at repackaging today's exhaustion as tomorrow's conversation.",
      'Two things I hate: explaining, and being explained to.',
      'Silence is not the absence of words. It is too many of them, and no patience.',
      'You are not lazy. You just left "starting" with tomorrow\'s you.',
      'Growing up is learning to pretend to check your phone in an elevator.',
      'The world will not stop because you are sad. It just gets louder.',
      'The only thing I have kept up lately is not giving up on giving up.',
      'You do not have to be excellent. Just do not be dishonest — especially with yourself.',
      'Some live to leave a mark. I live to not leave breakfast on the counter.',
      'Do not rush to understand the world. It has not understood you yet.',
      'Effort does not guarantee results, but it makes your excuses more elegant.',
      'Late night is good for thinking about life. Also for thinking it is worse than it is.',
      'I am not afraid of being alone. I am afraid someone knocks while I am.',
      'Real freedom is the nerve to disappoint someone.',
      'You do not need an audience. You need a clock that does not nag.',
      '"Next time, for sure" is the kindest lie adults tell each other.',
      'If today were the last day, I would probably still scroll for ten minutes first.',
      'We are all pretending to be busy. Busy pretending.',
      'Do not mistake silence for an answer. It just has not figured out how to refuse you.',
    ],
    rare: ['You are already doing more than you think.', 'This time, you actually can.', "Today's you is enough for today."],
  },
};

export const RARE_CHANCE = 0.08;

/** 把台词和情绪配对，构建时塞进页面。 */
export function poolFor(lang) {
  const src = gacha[lang];
  if (src.common.length !== MOODS.length) {
    throw new Error(`gacha.${lang}.common 有 ${src.common.length} 条，MOODS 有 ${MOODS.length} 条，对不上`);
  }
  return {
    common: src.common.map((text, i) => ({ text, mood: MOODS[i] })),
    rare: src.rare.map((text) => ({ text, mood: 'rare' })),
    rareChance: RARE_CHANCE,
  };
}
