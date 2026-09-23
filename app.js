'use strict';
const $=s=>document.querySelector(s), main=$('#main');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storage={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const state={lang:storage.get('bible.lang','s'),english:storage.get('bible.en',false),size:storage.get('bible.size',21),testament:'old'};
if(!['s','t'].includes(state.lang))state.lang='s';
state.size=Math.max(16,Math.min(32,Number(state.size)||21));
const name=b=>state.lang==='t'?b.traditional:b.name;
const url=(i,c=1,v='')=>`#read/${BIBLE[i].id}/${c}${v?'/'+v:''}`;
const groups=[['摩西五经',0,5],['历史书',5,17],['诗歌与智慧书',17,22],['大先知书',22,27],['小先知书',27,39],['四福音书',39,43],['历史书',43,44],['保罗书信',44,57],['普通书信',57,65],['启示录',65,66]];
const quotes=[['太初有道，道与神同在，道就是神。','约翰福音 1 : 1',42,1,1],['耶和华是我的牧者，我必不至缺乏。','诗篇 23 : 1',18,23,1],['你们必晓得真理，真理必叫你们得以自由。','约翰福音 8 : 32',42,8,32],['使人和睦的人有福了！因为他们必称为神的儿子。','马太福音 5 : 9',39,5,9]];
let quoteIndex=0,toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',2200)}
function settings(){document.documentElement.style.setProperty('--verse-size',state.size+'px');document.querySelectorAll('[data-lang]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.lang===state.lang));$('#english').setAttribute('aria-pressed',state.english)}
function catalog(){const start=state.testament==='old'?0:39,end=state.testament==='old'?39:66;return groups.filter(g=>g[1]>=start&&g[1]<end).map(g=>`<div class="book-group"><div class="group-label">${g[0]}</div><div class="book-grid">${BIBLE.slice(g[1],g[2]).map((b,j)=>`<a class="book-link" href="${url(g[1]+j)}"><span>${esc(name(b))}</span><small>${b.s.length}</small></a>`).join('')}</div></div>`).join('')}
function hero(){const q=quotes[quoteIndex];return `<span class="eyebrow">静 心 · 读 经</span><blockquote>${q[0]}</blockquote><div class="hero-bottom"><a href="${url(q[2],q[3],q[4])}">${q[1]} ↗</a><div class="dots">${quotes.map((_,i)=>`<button class="${i===quoteIndex?'active':''}" data-quote="${i}" aria-label="第 ${i+1} 条经文"></button>`).join('')}</div></div>`}
function home(){const recent=storage.get('bible.recent',null);main.innerHTML=`<div class="hero-layout"><section class="hero" aria-label="精选经文">${hero()}</section><section class="search-panel"><p class="section-kicker">READ & REFLECT</p><h2>从一句经文开始</h2><form id="search-form"><label for="keyword">在此输入关键词搜索全本圣经</label><div class="input-row"><input id="keyword" name="q" placeholder="例如：信心、盼望、爱" required maxlength="100"><button class="primary">搜索</button></div></form><form id="read-form" class="quick-read"><label for="book-select">或者直接选择经文阅读</label><div class="input-row"><select id="book-select" aria-label="选择经卷">${BIBLE.map((b,i)=>`${i===0?'<optgroup label="旧约">':i===39?'</optgroup><optgroup label="新约">':''}<option value="${i}">${esc(name(b))}</option>`).join('')}</optgroup></select><select id="chapter-select" aria-label="选择章节"></select><button class="primary">阅读</button></div></form><p class="hint">66 卷 · 1,189 章 · 和合本</p>${recent&&BIBLE[recent.i]?`<a class="resume" href="${url(recent.i,recent.c)}">继续上次阅读：${esc(name(BIBLE[recent.i]))} ${recent.c} 章 →</a>`:''}</section></div><section class="catalog"><div class="section-head"><h2>圣经目录 <small>　选择一卷，开始阅读</small></h2><div class="testaments"><button data-testament="old" aria-pressed="${state.testament==='old'}">旧约 39</button><button data-testament="new" aria-pressed="${state.testament==='new'}">新约 27</button></div></div><div id="catalog-books">${catalog()}</div></section><div class="quiet-note">留一段安静的时间，与经文相遇</div>`;fillChapters();$('#book-select').onchange=fillChapters;$('#read-form').onsubmit=e=>{e.preventDefault();location.hash=url(Number($('#book-select').value),Number($('#chapter-select').value))};$('#search-form').onsubmit=e=>{e.preventDefault();startSearch($('#keyword').value)}}
function fillChapters(){const i=Number($('#book-select').value);$('#chapter-select').innerHTML=BIBLE[i].s.map((_,n)=>`<option value="${n+1}">${n+1} 章</option>`).join('')}
function startSearch(q,scope='all'){q=q.trim();if(q)location.hash=`#search/${encodeURIComponent(q)}/${scope}/1`;else toast('请输入搜索关键词')}
function read(id,chapter,verse){const i=BIBLE.findIndex(b=>b.id===id),c=Number(chapter);if(i<0||!Number.isInteger(c)||c<1||c>BIBLE[i].s.length)return missing();const b=BIBLE[i],vs=b[state.lang][c-1];storage.set('bible.recent',{i,c});const saved=storage.get('bible.bookmarks',[]).some(x=>x.i===i&&x.c===c);let prev=c>1?url(i,c-1):i>0?url(i-1,BIBLE[i-1].s.length):null,next=c<b.s.length?url(i,c+1):i<65?url(i+1,1):null;document.title=`${name(b)} ${c} 章 · 中文和合本圣经`;
main.innerHTML=`<div class="breadcrumb"><a href="#home">圣经目录</a> / ${i<39?'旧约':'新约'} / ${esc(name(b))}</div><div class="reader-head"><h1>${esc(name(b))} <span>${c}</span> 章</h1><div class="reader-actions"><button class="outline" id="save">${saved?'★ 已加书签':'☆ 加入书签'}</button><button class="outline" id="copy">复制本章</button><a class="outline" href="#bookmarks">我的书签</a></div></div><nav class="chapter-list" aria-label="章节">${b.s.map((_,j)=>`<a href="${url(i,j+1)}" ${j+1===c?'aria-current="page"':''}>${j+1}</a>`).join('')}</nav><div class="reading">${[...new Set([...Object.keys(vs),...(state.english?Object.keys(b.en[c-1]):[])])].map(Number).sort((a,b)=>a-b).map(n=>`<div class="verse" id="verse-${n}"><a class="verse-number" href="${url(i,c,n)}" aria-label="第 ${n} 节">${n}</a><div><div class="verse-text">${esc(vs[n]||'〔本译本无此节号〕')}</div>${state.english?`<div class="en" lang="en">${esc(b.en[c-1][n]||'[No verse under this number in this edition.]')}</div>`:''}</div></div>`).join('')}</div><div class="pager">${prev?`<a class="outline" href="${prev}">← 上一章</a>`:'<span>全书起始</span>'}<a href="#home">目录</a>${next?`<a class="outline" href="${next}">下一章 →</a>`:'<span>全书结束</span>'}</div>${state.english?'<p class="hint" style="text-align:center">中英按原数据节号并排显示；个别章节的分节方式不同。</p>':''}`;
$('#save').onclick=()=>{let all=storage.get('bible.bookmarks',[]);const found=all.some(x=>x.i===i&&x.c===c);all=all.filter(x=>!(x.i===i&&x.c===c));if(!found)all.push({i,c});storage.set('bible.bookmarks',all);$('#save').textContent=found?'☆ 加入书签':'★ 已加书签';toast(found?'已移除书签':'已保存到我的书签')};$('#copy').onclick=async()=>{const text=`${name(b)} 第 ${c} 章\n`+Object.entries(vs).map(([n,t])=>`${n} ${t}${state.english?'\n'+(b.en[c-1][n]||''):''}`).join('\n');try{await navigator.clipboard.writeText(text);toast('已复制本章经文')}catch{download(text,`${name(b)}-${c}.txt`);toast('已改为下载本章文本')}};if(verse)requestAnimationFrame(()=>{const v=document.getElementById('verse-'+Number(verse));if(v){v.style.background='#f3edd7';v.scrollIntoView({block:'center'})}})}
function highlight(text,q){const parts=String(text).split(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'));return parts.map((p,i)=>i%2?'<mark>'+esc(p)+'</mark>':esc(p)).join('')}
function search(q,scope='all',page=1){if(!q||q.length>100)return missing();const results=[],needle=q.toLowerCase();BIBLE.forEach((b,i)=>{if(scope==='old'&&i>=39||scope==='new'&&i<39)return;b[state.lang].forEach((ch,j)=>Object.entries(ch).forEach(([n,text])=>{if(text.toLowerCase().includes(needle)||b[state.lang==='s'?'t':'s'][j][n]?.toLowerCase().includes(needle)||b.en[j][n]?.toLowerCase().includes(needle))results.push({i,c:j+1,n,text})}))});const pages=Math.max(1,Math.ceil(results.length/30));page=Math.min(pages,Math.max(1,Number(page)||1));main.innerHTML=`<div class="breadcrumb"><a href="#home">圣经目录</a> / 搜索</div><h1>查找经文</h1><form id="results-form" class="search-controls"><input id="search-query" aria-label="搜索关键词" value="${esc(q)}" required maxlength="100"><select id="scope" aria-label="搜索范围"><option value="all">全本圣经</option><option value="old">仅旧约</option><option value="new">仅新约</option></select><button class="primary">搜索</button></form><p class="hint">“${esc(q)}” · 找到 ${results.length} 节经文 · 第 ${page} / ${pages} 页</p>${results.slice((page-1)*30,page*30).map(r=>`<a class="result" href="${url(r.i,r.c,r.n)}"><strong>${esc(name(BIBLE[r.i]))} ${r.c} : ${r.n} →</strong><p>${highlight(r.text,q)}</p>${state.english||/[a-z]/i.test(q)?`<div class="en">${highlight(BIBLE[r.i].en[r.c-1][r.n]||'',q)}</div>`:''}</a>`).join('')||'<div class="empty">没有找到匹配经文。请试试更短的关键词。</div>'}<div class="pager">${page>1?`<a class="outline" href="#search/${encodeURIComponent(q)}/${scope}/${page-1}">← 上一页</a>`:''}${page<pages?`<a class="outline" href="#search/${encodeURIComponent(q)}/${scope}/${page+1}">下一页 →</a>`:''}</div>`;$('#scope').value=scope;$('#results-form').onsubmit=e=>{e.preventDefault();startSearch($('#search-query').value,$('#scope').value)}}
const newsItems=[
  {
    slug:"handcopying-old-testament",
    title:"手抄旧约圣经：像鸟飞去",
    collected:'2026-09-23',
    content:`
      <div class="news-body" lang="zh-Hans">
        <p>2019 年 12 月 5 日，我踏上手抄《圣经》的旅程。2022 年 9 月 28 日，我顺利抄完中英双语《圣经·旧约》，历时将近三年。直到现在我也不敢相信，自己会花如此漫长的时间做这件事。</p>
        <p>抄经前，我已经通读过一遍《圣经》，老师在课上也多次讲过《圣经》，再加上我看过的一些文学书，所有指向说明一点：要学好中英文，《圣经》是道迈不过的坎。</p>
        <p>还没抄经前，我觉得这是件很简单的事，内心有些轻视，自认为一年能抄完。踏上抄经之路，抄完几节，我发现不对劲，先是手的问题，很久没有提笔写字，酸痛不已。再是时间问题，连续抄写，一天最多一个小时，四十分钟左右最佳，超过时间限制，状态直线下降。</p>
        <p>抄完《创世记》，一个多月过去，我不免惊讶，看似不怎么厚的《圣经》，竟然这么多字。心里大概估计，按照中英双语的抄写速度，一天一章，算下来，至少也要三年。我想放弃，或减小难度，改抄一种语言，但脑子里很快给出否定答案。我的文学底子薄，中文差，英文更差，没有任何优势，好不容易找到快速成长的办法，不吃点苦，肯定不行，更何况抄经对我来说，无非是花些时间和体力，我坐在明亮的灯光下做这件事，如果抄不下去，能做好其他事吗？抄吧，一个多月已经过去，接下来也花不了多少时间。</p>
        <p>多数时间，抄经枯燥乏味，特别是经文里有大段的人名、地名、律法等，更令我头脑昏沉。《旧约》很复杂，我常硬着头皮往前抄，内心却暗自佩服，书里包含广博的知识与信息，这辈子如果能弄明白，哪怕是通过经文帮人解惑，我真的是没有遗憾了。</p>
        <p>在枯燥乏味的旅程中，我也会创造些有趣的事。起初抄经，我会打卡，拍照发朋友圈，再后来，突发奇想，希望能记录整个抄经的过程，于是在网上购买手机支架，录视频，发平台，与人共享。谁知道，为这事还引来不少麻烦。刚开始，我录好视频发国内各大视频网站，平台很宽容，能审核通过，没多久，各大平台逐渐对我的视频进行全面封杀，账号警告。为这事儿我很生气，直接抛弃国内平台，跑到 YouTube ，继续与人分享我的抄经历程。</p>
        <p>我还开过抄经直播，但次数不多，直播过于复杂，前期调试，选歌曲，调整相机位置，很繁琐，直播期间，我常分神，看有多少人互动，直接降低抄写速度，影响我的注意力，没播多久，我决定放弃。</p>
        <p>此外，我还有过购买打字机的冲动，但看过机器，发现打字机只能敲英文，我是中英文互抄，只好作罢。</p>
        <p>这些事做下来，我只保留了录视频，这种方式不花太多时间，不会令我分神，还能记录整个抄经的过程，是最优解。</p>
        <p>抄经还有一种乐趣：试笔。一支笔太重要了，能提升愉悦感。我买过许多不同种类的签字笔和钢笔，不同款式和品牌的笔差距很大，它们与纸的接触，有的太顺滑，有的太粗糙，有的漏墨……换来换去，最顺手的还是 0.38mm 的无印良品签字笔，每次电商优惠活动，我会买上好几盒备用。</p>
        <p>抄经不是死抄，要想记得牢靠，还有窍门。我发现如果看一个字，抄一个字，什么也记不住。看一句或一段，再默写，会在脑海中留有印象。我偶尔用这种方法训练记忆力，中文还行，能默记，英语实在是不行，基础太差，遇到生僻的人名，地名，单词，只能一个个地写。多数情况，我急于赶工，也会忘了默写。</p>
        <p>对我来说，整个抄经过程，最无法控制的因素是时间。我不清楚每天能否回家。按照制定的计划，如果没有意外情况，我不会断更，将抄经变成一种行为艺术。可惜，不断更的难度太大，工作要应酬、出差，如果应酬，再晚，我也尽量回家。有好几次我是在醉酒状态中抄经。遇到出差，我会在包里装上设备，到宾馆再抄。我最害怕突发重病，还好，抄《旧约》，我只发过一次高烧，无法提笔，其余时间，我从不给自己找借口。整个过程不如我心中设想的完美，多数情况，还是按照我的计划前进。</p>
        <p>如果要说抄经对我最大的考验，反而不是自身，而是外部影响。我最担心家人知道我抄《圣经》，极力反对，庆幸的是，无论是发朋友圈打卡，还是当着他们面抄经，他们只觉得我是在工作，并没有任何干涉或阻拦。爸妈只会在熬夜太晚时叮嘱我早点睡觉，他们对我的包容，使我安心。</p>
        <p>反而在工作中，遇到许多同事和朋友不理解，哪怕我告诉他们，《圣经》是世界上最好的作品，值得反复读，又或是，西方世界的源头是《圣经》，不读，一辈子只能当作门外汉，我甚至告诉他们，许多作家深受其影响，他们的作品里有许多和经文相关的隐喻。可惜无论我怎么解释，毫无用处。我和他们争辩过几次，发现全无意义，大家不在一个话语体系，没办法讨论。后来我想明白了，完全不需要向他们解释，大家各自修行，互不打扰。我抄经，别人怎么看，那是他们的事，与我无关，只要不在我面前吵闹，和而不同，求同存异吧。经文不也告诉我，要学会包容吗？</p>
        <p>抄经对我来说，还有一个影响：身边朋友骤减。我无法参加朋友们的夜间活动。有朋友邀约聚会，只能拒绝，实在无法推辞，我会尽量约定休息日，赴约前，白天抄完一节再去。</p>
        <p>回到文章开头的问题：抄经是否有助于提高我的写作能力。我的感觉是：能。以前我写跑步随笔，只能写一些虚头巴脑的文字，现在已经能写清楚内心感受。读过的书，看过的电影，也能用文字清楚表达。如果要说遗憾，或许是我英语的进步过于缓慢，自己的文字风格还未形成。</p>
        <p>在无数抄经的夜里，我看着远处建筑的灯一盏盏熄灭，大地逐渐暗去，我的书桌发着微光，会时不时惊觉，不知道从什么时候开始，我已经习惯抄经，它成为我生活的一部分，每天必做的工。</p>
        <p>将近三年时间抄写《旧约》，每当我内心有诸多困惑，脑海里会浮现一些经文的片段，偶尔迷惘，也会在经文里寻找答案，我的内心变得更坚定。以前有人问我，是不是基督徒，我会告诉对方：「不是。」现在，如果有人问我，我的回答是：「我在信仰的路上。」</p>
        <p>「我是投靠耶和华；你们怎么对我说：你当像鸟飞往你的山去。」</p>
      </div>
    `
  },
  {
    slug:"copied-the-whole-bible",
    title:"抄完《圣经》：那美好的仗我已经打过了",
    collected:'2026-09-23',
    content:`
      <div class="news-body" lang="zh-Hans">
        <p>2019 年 12 月 5 日，我踏上抄《圣经》的旅途；</p>
        <p>2022 年 9 月 28 日，时隔两年多，我抄完《旧约》；</p>
        <p>2023 年 11 月 5 日，时隔一年多，我抄完《新约》；</p>
        <p>至此，我在近 4 年的长途跋涉中，抄完整本《圣经》（KJV+和合本）。</p>
        <p>抄完那一刻，我完全不敢相信这件事已经完成。哪怕时隔一周，我坐在电脑前写这篇抄经心得，回忆往日种种场景，依旧如梦。</p>
        <p>我记得抄完那一刻，我先是打开手机相册，翻以前抄经的照片，准备发朋友圈。我不停滑动屏幕，往事不断浮现，一天天，一月月，一年年。</p>
        <p>我翻照片，想起 2019 年的 12 月，自己正欢欢喜喜和以前的同事庆祝圣诞节。大家坐在烤全羊边，商量回家过年的事，谁能想到，我回家过年的第二天，疫情暴发了，城市笼罩了一层白色的迷雾。</p>
        <p>四年多的时间，我有一大半时间在和疫情赛跑，很难说这是冥冥之中的保佑，还是其他什么原因。我在无数哀嚎哭泣的夜里，通过手机，看见深夜人们发出绝望的声音，我不知道自己能做什么，只能抄经。无论冷热，无论悲喜，我在黑夜的笼罩下，坐在自己的书桌前，打开 iPad，架设手机，拿起纸笔，循环地抄写《圣经》里的每一个字。</p>
        <p>我抄经的照片里出现次数最多的是两只猫。一只猫叫闷墩儿，性格顽劣，调皮捣蛋，它是我抄经两个多月后收留的流浪猫。我现在还记得曾经那狭窄的租房，斑驳的楼道外，她被一只大白猫追着打。我不忍心，捉回来，发现她屁股粘着一坨臭烘烘的硬疙瘩，太臭了，我喂完猫粮，甩出去。给她洗干净，再用吹风机烘干。从此以后，她成了我抄经时的陪伴，不停在我的桌子前翻肚皮、打滚、撒娇。</p>
        <p>闷墩儿陪伴我度过疫情最艰难的时光，在漫长的黑夜里，在全面封禁的城市中，我和她，度过一个又一个抄经的时光。这些时间里，我总担心，如果不小心得了新冠，还能不能继续抄经？闷墩儿要断了粮了怎么办？所幸，这一切没有到来。</p>
        <p>按照人类发展的规律，大流行病会有一段凶猛期，随后，随着传播与人类自身抵抗加强，病毒的效力会随之递减。两年多的疫情，病毒的效力正在减弱。在这段时间，我搬离租屋，在家人的帮助下，有了自己人生中第一套房。住进新房没多久，我疏于照顾，没看住闷墩儿，在我的《旧约》快要完成时，她离开了我，回到了喵星。</p>
        <p>2022 年 11 月 3 日，当世界各国逐渐解封，我所住的小区开始加强封控。闲来无事，我抄完经，开始学拍照，此时的我已于 7 月被公司辞退，找到新工作不到一月。我预感接下来会发生不寻常的事，紧要关头是多学点儿技能。我每天抄完经，会在电脑上看摄影教程，再利用休息时间下楼，在小区里转悠，学习拍照技巧。</p>
        <p>由于疫情关系，我人生中有一大半时间靠抄经度过，另一半的时间是为生计奔波。长期不安定的工作环境，我无时无刻不在考虑增加自己的技能。</p>
        <p>抄完《旧约》，按照计划，只要不出意外，我能抄完《新约》。我开始给自己增加额外的学习时间。我将学英语、练字和设计提上日程。同时，在写作方面，我尝试写段子，从写实的记录叙事，慢慢转到虚拟创作。我不断增加学习项目，以致每天晚上一两点才能入睡，严重的是，疫情封控彻底解除后的 2022 年 12 月 5 日，我得了一次新冠，强烈的发烧使我不得不中断抄经，等熬过艰难时刻，我才重拾抄经之旅。</p>
        <p>熬过新冠病毒，我又重新找到一份新工作，此时快要过年。我父亲回老家早，一天抄完经，他打电话问我，养不养猫，电话那头他说：「这猫很好看，虎头虎脑，像个弥勒佛。」难道冥冥之中有所感应？闷墩儿陪我走过《旧约》的旅途，上帝怕我孤单，找一只猫来陪我走《新约》。我满口答应。</p>
        <p>过完年，我有了一只名叫香槟的英短，他开始陪我完成《新约》的旅行。或许每一只猫都有性格，但闷墩儿和香槟都有一个爱好，喜欢在我抄经的时候打扰我，蹭我的手、打滚、翻肚皮，很难说这不是另一种缘分。</p>
        <p>《新约》的抄经之旅对我来说并不难，它甚至比《旧约》还简单，许多经文和句子异常熟悉。在整个过程中，我发现一个有效吸收经文的方法：抄完，读一遍。后来我才明白，原来学《圣经》，不能只动笔，还要动口。这一方法用来学任何一门外语都适用。语言与文字，原本是用来交流的，要学习，口手并用最有奇效。可惜我明白这一道理有些太晚，浪费了许多读经的宝贵时间。</p>
        <p>阳过后，我的身体有些异样，特别犯困。我想到抄经已接近尾声，不免有些惫懒，开始有一搭，没一搭地抄，常常一天能抄完的内容，要两三天完成。这一晃，四福音书完成，我再看时间，按照半年抄完《新约》的计划，一年过去一大半，如果要在今年抄完，需要加快速度。</p>
        <p>2023 年 10 月 10 日，抄完第五章《新约·希伯来书》，我决定先把手里学英语、练字和设计的计划停一停，加速完成最后的章节。从那天起，我开始每天抄三章经。</p>
        <p>我很庆幸，找到一家不怎么加班，离家近的工作，每天通勤时间 8 分钟。得益于工作便利，我回到家的第一件事，先抄一章经，抄完躺床上休息，睡醒起来，继续抄两章，如此不间断，在快要完成时，麻烦来了。</p>
        <p>三年多的时间，我长时间趴桌上机械运动，右手肩膀部位酸痛，往常还能忍忍，但今年的手特别酸痛，我试过许多方法，最后发现做引体向上能缓解肩膀酸痛。我抄二三十分钟，需要拉伸肩膀，如此往复，一直抄到《犹大书》。</p>
        <p>最后是《启示录》，一共二十二章，我又加快了速度，希望在一周内抄完。工作日，我每天抄三章，休息日，我抄四章。这段时间很煎熬，我一边抄，一边翻看章节，明明只有二十二章，像是永远没有尽头，字迹也变得歪七倒八，整个人也发懵，手臂的酸痛感加剧，我想丢掉纸笔，但脑海中始终有个声音在提醒我：黑夜将尽，要看到光了。是啊，我已经走了 99% 的旅程，怎么能在临近结尾时放弃呢？我听着内心的声音，想到立下的誓言要完成，又想到自己估计是为数不多能抄完整本《圣经》（KJV+和合本）的人，又想到远处的光在指引我，我硬生生挣扎起来，一笔又一笔地写，一页又一页地翻，笔没墨了就换，笔记本写完就换一本，我不停向前，一步一步。</p>
        <p>2023 年 11 月 5 日晚 7 点，写完「阿门」，我终于完成了自己所立下的约。无数个日夜兼程，我不停向前跑，现在一切都结束了。我抵达了迦南美地，我有很多话想说，但不知道从何说起，心里有句话在我脑海中回响：</p>
        <p>那美好的仗我已经打过了，当跑的路我已经跑尽了，所信的道我已经守住了。（提摩太后书 4:7，和合本）</p>
        <p>I have fought a good fight, I have finished my course, I have kept the faith: (2 Timothy 4:7 KJV)</p>
        <p>（终）</p>
      </div>
    `
  },
{
  slug:'wedevote-lsb',
  title:'微读圣经上线 LSB 译本',
  source:'WeDevote Bible 微读圣经',
  sourceUrl:'https://www.facebook.com/wedevotebible',
  collected:'2026-09-23',
  originalUrl:'https://www.facebook.com/wedevotebible/posts/pfbid0CcuLwnbSuhLUXVUoeSXTNheaYjvnbjKL2XYoUazrZG3BRji9G2L51ac4QeVcG3Vul',
  content:`
      <div class="news-body" lang="zh-Hant">
        <p>和合本把神的名譯作「耶和華」——那是希伯來文四個字母 YHWH 的音譯。但你對照英文聖經會發現，KJV、NIV、ESV 大多譯成 the LORD（全大寫）：名字變成了頭銜。</p>
        <p>LSB（Legacy Standard Bible，The Lockman Foundation 2021）做了和和合本一樣的選擇。官網的說法是：「In the LSB, God's covenant name is rendered as Yahweh, as opposed to LORD.」短形式還保留了 Yah。</p>
        <p>它不是從零開始的新譯本，是在 NASB 95 上修訂的：「The goal was not to create a new translation but to refine an already excellent one.」譯經原則是 word-for-word，官網自比為「a window」——讓讀者看見作者的原意，而不是譯者的觀點。</p>
        <p>LSB 現在可以在微讀聖經裏讀。</p>
        <p class="news-howto">打開「微讀聖經」App → 點首頁「閱讀聖經」→ 點頁面上方的聖經版本 → 下滑即可看到 LSB</p>
        <p>網頁版：<a href="https://wedevote.com/bible/lsb/gen/1" target="_blank" rel="noopener">wedevote.com/bible/lsb/gen/1 ↗</a></p>
      </div>
      <figure class="news-figure"><a href="assets/news/wedevote-lsb.jpg" target="_blank" rel="noopener" aria-label="查看微读圣经 LSB 上线配图原图"><img src="assets/news/wedevote-lsb.jpg" width="1638" height="2048" alt="微读圣经宣布收录 LSB 英文译本：逐字直译、承继 NASB、将神的名译作 Yahweh，可与中文译本对照阅读。" loading="lazy" decoding="async"></a><figcaption>微读圣经 LSB 译本上线配图 · 点击查看原图</figcaption></figure>
  `
}];
function news(slug){
  const item=slug?newsItems.find(x=>x.slug===slug):null;
  if(slug&&!item)return missing();
  if(!item){
    document.title='圣经资讯 · 中文和合本圣经';
    main.innerHTML=`<div class="prose news-page">
      <div class="breadcrumb"><a href="#home">圣经目录</a> / 圣经资讯</div>
      <h1>圣经资讯</h1>
      <div class="news-list">${newsItems.slice().sort((a,b)=>b.collected.localeCompare(a.collected)).map(x=>`<article class="news-list-item">
        <h2><a href="#news/${encodeURIComponent(x.slug)}">${esc(x.title)}</a></h2>
        <div class="news-list-meta"><span>收录：<time datetime="${esc(x.collected)}">${esc(x.collected)}</time></span>${x.source?`<span>来源：${esc(x.source)}</span>`:''}</div>
        <a class="news-read-more" href="#news/${encodeURIComponent(x.slug)}">阅读全文 →</a>
      </article>`).join('')}</div>
    </div>`;
    return;
  }
  document.title=`${item.title} · 圣经资讯 · 中文和合本圣经`;
  main.innerHTML=`<div class="prose news-page">
    <div class="breadcrumb"><a href="#home">圣经目录</a> / <a href="#news">圣经资讯</a> / ${esc(item.title)}</div>
    <article class="news-entry" aria-labelledby="news-article-title">
      <h1 id="news-article-title">${esc(item.title)}</h1>
      <div class="news-meta">${item.source?`<span>来源：${item.sourceUrl?`<a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener">${esc(item.source)}</a>`:esc(item.source)}</span>`:''}<span>收录：<time datetime="${esc(item.collected)}">${esc(item.collected)}</time></span>${item.originalUrl?`<a href="${esc(item.originalUrl)}" target="_blank" rel="noopener">查看原帖 ↗</a>`:''}</div>
      ${item.content}
    </article>
  </div>`;
}
function bookmarks(){const all=storage.get('bible.bookmarks',[]).filter(x=>BIBLE[x.i]?.s[x.c-1]);main.innerHTML=`<div class="breadcrumb"><a href="#home">圣经目录</a> / 我的书签</div><h1>我的书签</h1><p class="hint">书签保存在当前浏览器中。</p>${all.map(x=>`<a class="result" href="${url(x.i,x.c)}"><strong>${esc(name(BIBLE[x.i]))} ${x.c} 章 →</strong><p>${esc(BIBLE[x.i][state.lang][x.c-1][1]||'')}</p></a>`).join('')||'<div class="empty">还没有书签。阅读时点击“加入书签”，下次从这里继续。</div>'}`}
function download(text,filename){const a=document.createElement('a'),u=URL.createObjectURL(new Blob(['\ufeff',text],{type:'text/plain;charset=utf-8'}));a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function downloads(){main.innerHTML=`<div class="prose"><div class="breadcrumb"><a href="#home">圣经目录</a> / 资源下载</div><h1>把经文留在手边</h1><p>下载 TXT 文本或 PDF，用于离线阅读。</p>${[['s','和合本 · 简体'],['t','和合本 · 繁体'],['en','King James Version']].map(([k,n])=>`<div class="download-row"><div><h3>${n}</h3><p>66 卷 · TXT 文本</p></div><button class="outline" data-download="${k}">下载全文 ↓</button></div>`).join('')}<h2 class="pdf-heading">NET 圣经中文版</h2><p>新英语译本 NET 的中文版（简体） · 译者序及 66 卷。原站更新日期：2011-12-15。</p><div class="download-row pdf-row"><div><h3>全部 67 份 PDF</h3><p>可逐卷下载，也可下载包含序言的完整 ZIP 文件包。</p></div><div class="pdf-actions"><a class="outline" href="downloads/net-chinese/">逐卷下载</a><a class="outline" href="downloads/net-chinese/sc_pdf_20111215.zip" download>整包下载 ↓</a></div></div><p>原始来源：<a href="https://bible.org/chinese/e/download/pdf" target="_blank" rel="noopener">Bible.org 中文 NET PDF 下载页</a>。版权与使用说明请参见原始来源及译者序。</p><h2 class="pdf-heading">译名定制版 PDF</h2>${[['sigao-with-cuv-names','《思高本圣经》PDF','和合本译名定制版','梅瑟→摩西'],['cuv-with-sigao-names','《和合本圣经》PDF','思高本译名定制版','摩西→梅瑟']].map(([repo,title,edition,direction])=>`<div class="download-row pdf-row"><div><h3>${title}</h3><p>${edition}：<strong>${direction}</strong></p></div><div class="pdf-actions"><a class="outline" href="https://github.com/baibanbao/${repo}/blob/main/pdf/${repo}.pdf" target="_blank" rel="noopener">查看 PDF</a><a class="outline" href="https://raw.githubusercontent.com/baibanbao/${repo}/main/pdf/${repo}.pdf" target="_blank" rel="noopener" download="${repo}.pdf">下载 PDF ↓</a></div></div>`).join('')}</div>`}
function about(){main.innerHTML=`<article class="prose"><div class="breadcrumb"><a href="#home">圣经目录</a> / 关于本站</div><h1>让阅读回到经文本身</h1><p>这是参考 <a href="https://www.chinesebibleonline.com/" target="_blank" rel="noopener">中文圣经在线</a> 制作的独立无广告版本，与原站没有运营或隶属关系。保留经卷目录、全文搜索和中英对照，并适配手机阅读。</p><h2>经文版本</h2><p>中文使用和合本简体与繁体数据，英文使用 King James Version（KJV）。数据来自 <a href="https://getbible.net/api/" target="_blank" rel="noopener">GetBible</a> 的 cus、cut、kjv 数据集，来源目录将中文数据标为 Public Domain；KJV 数据标为 GPL，CrossWire 在随附说明中允许为任何目的使用其整理文本。完整来源与许可说明保存在 data/translation-metadata.json。经文按原始节号显示；不同译本个别分节方式可能不同。NIV 未收录。</p><h2>没有广告，也没有追踪</h2><p>阅读、搜索、字体设置和书签均在本地浏览器中完成。页面不会加载广告、统计脚本或第三方字体。所有经文和首页图片随站点一同保存，无需向原站请求经文。</p><h2>页面来源</h2><p>布局、配色及首页风景图参考原站；本站标识重新绘制。原站图片的权利归其权利人所有。网站源码托管于 GitHub，页面由 GitHub Pages 提供。</p></article>`}
function missing(){main.innerHTML='<div class="empty"><h1>没有找到这一页</h1><a class="outline" href="#home">返回圣经目录</a></div>'}
function route(){if(!window.BIBLE){main.innerHTML='<div class="empty">经文数据未载入，请检查 data/bible.js 是否与网页保存在同一目录，然后刷新。</div>';return}settings();document.title='中文和合本圣经';let parts;try{parts=location.hash.slice(1).split('/').map(decodeURIComponent)}catch{return missing()}window.scrollTo(0,0);switch(parts[0]){case 'read':read(parts[1],parts[2],parts[3]);break;case 'search':search(parts[1],['all','old','new'].includes(parts[2])?parts[2]:'all',parts[3]);break;case 'news':news(parts[1]);break;case 'bookmarks':case 'saved':bookmarks();break;case 'downloads':downloads();break;case 'about':about();break;case '':case 'home':home();break;default:missing()}}
document.addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;if(el.dataset.lang){state.lang=el.dataset.lang;storage.set('bible.lang',state.lang);route()}if(el.id==='english'){state.english=!state.english;storage.set('bible.en',state.english);route()}if(['smaller','larger'].includes(el.id)){state.size=Math.max(16,Math.min(32,state.size+(el.id==='larger'?1:-1)));storage.set('bible.size',state.size);settings();toast('经文字号：'+state.size)}if(el.dataset.testament){state.testament=el.dataset.testament;$('#catalog-books').innerHTML=catalog();document.querySelectorAll('[data-testament]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.testament===state.testament))}if(el.dataset.quote!==undefined){quoteIndex=Number(el.dataset.quote);$('.hero').innerHTML=hero()}if(el.dataset.download){const k=el.dataset.download,text=BIBLE.map(b=>(k==='t'?b.traditional:b.name)+'\n\n'+b[k].map((ch,c)=>`第 ${c+1} 章\n`+Object.entries(ch).map(([n,t])=>`${c+1}:${n} ${t}`).join('\n')).join('\n\n')).join('\n\n');download(text,`bible-${k}.txt`);toast('已生成全文下载')}});
window.addEventListener('hashchange',route);route();
