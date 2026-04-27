import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./TravelRouteModule.css";

// 图片路径修改
const MAP_IMG = "/src/assets/images/route/map.png";
const WELCOME_BG = "/src/assets/images/route/background.jpg";
const FLASH_IMG = "/src/assets/images/route/flash.png";
// 音频路径修改
const BGM_URL = "/src/assets/audio/bgm1.mp3";
const CLICK_SOUND_URL = "/src/assets/audio/while_clink1.wav";
const DETAIL_SOUND_URL = "/src/assets/audio/while_clink2.wav";

function getBgmAudio() {
  const key = "__pinyao_travel_bgm__";
  if (typeof window === "undefined") return null;
  if (window[key] instanceof HTMLAudioElement) return window[key];
  const audio = new Audio(BGM_URL);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.3;
  window[key] = audio;
  return audio;
}

function setBgmVolume(next) {
  const a = getBgmAudio();
  if (!a) return;
  a.volume = Math.max(0, Math.min(1, next));
}

function playBgm() {
  const a = getBgmAudio();
  if (!a) return;
  a.play().catch(() => {});
}

function playOneShot(url, volume) {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
}

const ROUTE_LABELS = [
  { id: 1, label: "线路1：北门出发二日游（共十景点）" },
  { id: 2, label: "线路2：南门出发二日游（共十景点）" },
  { id: 3, label: "线路3：北门出发一日游（共六景点）" },
  { id: 4, label: "线路4：南门出发一日游（共六景点）" },
];

// 景点图片路径统一修改
const img = (routeId, sceneId) =>
  `/src/assets/images/route/route${routeId}/scene${String(sceneId).padStart(3, "0")}.png`;

// 来自组员代码的光圈（flash）相对背景的定位百分比（left/top）。
// route1：10 个
const FLASH_POSITIONS_R1 = [
  { left: "51.71%", top: "8.30%" },
  { left: "49.80%", top: "26.35%" },
  { left: "58.66%", top: "25.83%" },
  { left: "39.00%", top: "35.88%" },
  { left: "52.77%", top: "41.59%" },
  { left: "56.51%", top: "48.76%" },
  { left: "66.78%", top: "58.54%" },
  { left: "49.54%", top: "59.09%" },
  { left: "68.15%", top: "63.79%" },
  { left: "13.38%", top: "75.44%" },
];

// route2：10 个
const FLASH_POSITIONS_R2 = [
  { left: "56.01%", top: "78.30%" },
  { left: "67.30%", top: "64.05%" },
  { left: "65.86%", top: "57.83%" },
  { left: "56.00%", top: "47.88%" },
  { left: "56.17%", top: "50.89%" },
  { left: "32.51%", top: "38.76%" },
  { left: "39.08%", top: "35.94%" },
  { left: "52.94%", top: "42.09%" },
  { left: "48.15%", top: "58.79%" },
  { left: "12.38%", top: "75.44%" },
];

// route3：6 个
const FLASH_POSITIONS_R3 = [
  { left: "51.71%", top: "8.30%" },
  { left: "49.80%", top: "26.35%" },
  { left: "52.66%", top: "41.83%" },
  { left: "39.00%", top: "35.88%" },
  { left: "48.27%", top: "58.59%" },
  { left: "56.51%", top: "50.76%" },
];

// route4：6 个
const FLASH_POSITIONS_R4 = [
  { left: "51.71%", top: "8.30%" },
  { left: "49.80%", top: "26.35%" },
  { left: "58.66%", top: "25.83%" },
  { left: "39.00%", top: "35.88%" },
  { left: "52.77%", top: "41.59%" },
  { left: "56.51%", top: "48.76%" },
];

const routeData = {
  1: {
    routeId: 1,
    title: "北门出发二日游",
    scenes: [
      {
        id: 1,
        image: img(1, 1),
        title: "平遥古城墙北门入口",
        subtitle: "明洪武三年（1370年）扩建、改造而成，现周长6.4千米的砖石城墙",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "现周长6.4千米的砖石城墙为明洪武三年（1370年）扩建、改造而成。外观略呈方形，东、西、北三面俱直，唯南墙蜿蜓，形似「神龟」，真是「龟前戏水，山水朝阳，城之修建，依此为胜」。古城墙的历史文化和军事防御功能体现了明清时期中国北方城池典型特点，承载厚重的历史文明，是世界文化遗产平遥古城的重要组成部分。城墙环城有3000个垛口，72座敌楼，寓意孔子「三千弟子，七十二贤人」的历史典故，在庞大的军事设施上体现了浓厚的儒家思想。平遥古城是一部用秦砖汉瓦写就得千年古书，每一条砖缝里都浓缩着历史的记忆，是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 2,
        image: img(1, 2),
        title: "二郎庙",
        subtitle: "专门供奉二郎神的道教庙宇",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥古城二郎庙是专门供奉二郎神的道教庙宇，它始建于清代。整座庙宇坐西朝东，共三进院落，面积约3000多平方米，由正殿、玉皇殿、列宿殿、东岳殿等十余座殿堂组成。这座气势宏大、结构严谨的庙宇，显示出庄严穆的气氛，在我国祠庙建筑中堪称珍品。",
      },
      {
        id: 3,
        image: img(1, 3),
        title: "马家大院博物馆",
        subtitle: "平遥清代「四大富商」之首马中选的故居",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "马家大院是平遥清代「四大富商」之首马中选的故居。他出生于中医世家，随父临症，得中举人。一生秉承家传，尽得其学，养成了高尚的医德，为更好得发扬家传中医，造福百姓，做出了巨大贡献。马家大院总占地面积约6000平方米，共有3座大院，6座小院，集民居建筑、风俗文化、豪门起居、商贾兴衰为一体，有「平遥第一大院」之美誉。",
      },
      {
        id: 4,
        image: img(1, 4),
        title: "日昇昌票号",
        subtitle: "创立于公元1823年，是中国首家票号",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "中国票号博物馆（日昇昌票号）位于平遥古城西大街南侧原日昇昌票号旧址，日昇昌票号创立于公元1823年，是中国首家票号，被人们称为「中国银行的乡下鼻祖」，是中国金融发展史上的里程碑，具有划时代的意义。三年之后1826年，「日昇昌」在中国多个省份先后设立分支机构。19世纪40年代，它的业务更进一步扩展到日本、新加坡、俄罗斯等国家。当时在「日昇昌」票号的带动下，平遥的票号业发展迅猛，一度成为中国金融业的中心。即使到现在对于经营管理仍有极其重要的现实借鉴意义。日昇昌票号作为全国重点文物保护单位是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 5,
        image: img(1, 5),
        title: "平遥科技艺术馆",
        subtitle: "SoReal焕真平遥科技艺术馆智慧旅游沉浸式体验新空间",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "该馆总占地面积约三千余平方米。共八个主题区域，公共区域、漫步云桥、光阴流逝、泗水归堂、光影秀、VR影院、画展区、茶文化体验区。每个区域各代表一个空间维度，每个空间都与光影有关，利用投影机融合技术、多媒体互动投影技术、水流控制系统、激光灯图案投影同步技术及VR、AR 等先进高新科技，为历史人文的平遥古城增添当代艺术色彩，通过参观、体验、互动，不断穿梭于虚拟、现实的交替中，感受千年传统与现代科技的融合。整个科技馆应用高新科技、新艺术展示形式进行平遥历史文化的输出和平遥文化底蕴的展示，吸引年轻一代到访，助力平遥传统历史文化在年轻群体之间的传播，已成为平遥古城的网红打卡地。",
      },
      {
        id: 6,
        image: img(1, 6),
        title: "协同庆钱庄博物馆",
        subtitle: "协同庆被慈禧太后誉为「顶得上山西省藩库」的大票号",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "协同庆是中国票号业中一家独具特色的票号。它创办于1856年，歇业于1913年。财东系榆次聂店富商王栋和平遥王智村大贾米秉义，该号曾被慈禧太后誉为「顶得上山西省藩库」的大票号。古城中央，金井楼下，协同庆钱庄博物馆以精美的建筑、独特的格局、丰富的内容吸引着众多游客慕名而来。协同庆票号旧址建筑风格新颖别致，集楼、房、亭、窑于一身，可谓平遥古城内明清店铺院落的缩影。现有展室30个，2008年，协同庆博物馆被评为国家AAAA级景区。",
      },
      {
        id: 7,
        image: img(1, 7),
        title: "城隍庙",
        subtitle: "「诸神共居一庙，联袂同受香火」",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "城隍庙位于古城隍庙街，1973年11月5日被列入县级文物保护单位，2006年被列入国家级文物保护单位。是国家AAAA级旅游景点。城隍庙总占地面积7302平方米，庙貌宏伟，现已恢复庙区面积3672.18平方米。由山门而入，过前院，灶君庙和财神庙分置于东西两侧，左右互通、庙宇相连，组合成「诸神共居一庙，联袂同受香火」的奇特景致。殿宇、廊庑、楼阁、坊、台形制多样，结构精妙，城隍戏台之重檐回廊、财神庙乐楼之八卦藻井都属罕见古建营式；满布殿宇屋顶的琉璃艺术叫人称奇，蓝、绿为主，黄色相间组成青冷色调，渲染了神秘的意境，其仙人走兽，龙吻脊刹，造型精美，色泽如初，是清代琉璃工艺杰作的范例。",
      },
      {
        id: 8,
        image: img(1, 8),
        title: "平遥县衙",
        subtitle: "与城隍庙对称布置，分司县治阴、阳两界之职责",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥县衙始建于元至正六年（1346年），除少量元代建筑外，大部分为明代万历年间重修，属明清规制。规模宏大完整，由牌楼、仪门、六部、牢狱、大堂、二堂、大仙楼、内宅、花园等组成，与城隍庙对称布置，分司县治阴、阳两界之职责，为封建王朝县级建制典型代表。平遥县衙保留下来的明清时期大量实物及档案资料，为研究中国古代政治、经济、文化提供了难得的依据和实证。",
      },
      {
        id: 9,
        image: img(1, 9),
        title: "文庙",
        subtitle: "全国现存最早的文庙",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥文庙学宫是全国现存最早的文庙，是国学圣地，在这里能感受到浓浓的孔子文化和儒学文化。文庙位于平遥古城城隍庙街北侧，始建于金大定三年（1163年），南北中轴线上有棂星门，泮池、大成殿、明伦堂、尊经阁、敬一亭、东西厢房有时习斋，日新斋；建筑艺术高超，殿宇宏敞，层次有致，是全国各地孔庙中最早的且唯一的宋代建筑。平遥文庙历史悠久，规模宏大、气势雄伟、形制典型，是我国华北地区保存最完整、规模最大、最具特色的一座孔庙。作为世界文化遗产——平遥古城的重要组成部分、全国重点文物保护单位，其建设选址、建筑风格、殿堂配置是儒家礼制思想在建筑上的集中反映。",
      },
      {
        id: 10,
        image: img(1, 10),
        title: "双林寺",
        subtitle: "汉化佛寺，佛像题材融合了佛教的不同宗派",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "双林寺坐落于平遥古城西南6公里的桥头村，「汉文帝为代王都于此」，故原名「中都寺」，北宋时期更名为「双林寺」。是世界文化遗产平遥古城的重要组成部分。双林寺，一座汉化佛寺，佛像题材已融合了佛教的不同宗派，彩塑人物的面相和装束，鲜有古印度的风情，而殿堂的配置更深具中国特色。寺内唐槐、宋碑、明钟，均属稀世珍宝；2052尊彩塑形态各异，极具神韵。古代壁画异彩纷呈，飘逸俊美。",
      },
    ],
    flashPositions: FLASH_POSITIONS_R1,
  },
  2: {
    routeId: 2,
    title: "南门出发二日游",
    scenes: [
      {
        id: 1,
        image: img(2, 1),
        title: "迎薰门",
        subtitle: "迎纳东南方的和薰之风",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "现周长6.4千米的砖石城墙为明洪武三年（1370年）扩建、改造而成。外观略呈方形，东、西、北三面俱直，唯南墙蜿蜓，形似「神龟」，真是「龟前戏水，山水朝阳，城之修建，依此为胜」。古城墙的历史文化和军事防御功能体现了明清时期中国北方城池典型特点，承载厚重的历史文明，是世界文化遗产平遥古城的重要组成部分。城墙环城有3000个垛口，72座敌楼，寓意孔子「三千弟子，七十二贤人」的历史典故，在庞大的军事设施上体现了浓厚的儒家思想。平遥古城是一部用秦砖汉瓦写就得千年古书，每一条砖缝里都浓缩着历史的记忆，是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 2,
        image: img(2, 2),
        title: "文庙",
        subtitle: "全国现存最早的文庙",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥文庙学宫是全国现存 earliest的文庙，是国学圣地，在这里能感受到浓浓的孔子文化和儒学文化。文庙位于平遥古城城隍庙街北侧，始建于金大定三年（1163年），南北中轴线上有棂星门，泮池、大成殿、明伦堂、尊经阁、敬一亭、东西厢房有时习斋，日新斋；建筑艺术高超，殿宇宏敞，层次有致，是全国各地孔庙中最早的且唯一的宋代建筑。平遥文庙历史悠久，规模宏大、气势雄伟、形制典型，是我国华北地区保存最完整、规模最大、最具特色的一座孔庙。作为世界文化遗产——平遥古城的重要组成部分、全国重点文物保护单位，其建设选址、建筑风格、殿堂配置是儒家礼制思想在建筑上的集中反映。",
      },
      {
        id: 3,
        image: img(2, 3),
        title: "城隍庙",
        subtitle: "「诸神共居一庙，联袂同受香火」",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "城隍庙位于古城隍庙街，1973年11月5日被列入县级文物保护单位，2006年被列入国家级文物保护单位。是国家AAAA级旅游景点。城隍庙总占地面积7302平方米，庙貌宏伟，现已恢复庙区面积3672.18平方米。由山门而入，过前院，灶君庙和财神庙分置于东西两侧，左右互通、庙宇相连，组合成「诸神共居一庙，联袂同受香火」的奇特景致。殿宇、廊庑、楼阁、坊、台形制多样，结构精妙，城隍戏台之重檐回廊、财神庙乐楼之八卦藻井都属罕见古建营式；满布殿宇屋顶的琉璃艺术叫人称奇，蓝、绿为主，黄色相间组成青冷色调，渲染了神秘的意境，其仙人走兽，龙吻脊刹，造型精美，色泽如初，是清代琉璃工艺杰作的范例。",
      },
      {
        id: 4,
        image: img(2, 4),
        title: "协同庆钱庄博物馆",
        subtitle: "协同庆被慈禧太后誉为「顶得上山西省藩库」的大票号",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "协同庆是中国票号业中一家独具特色的票号。它创办于1856年，歇业于1913年。财东系榆次聂店富商王栋和平遥王智村大贾米秉义，该号曾被慈禧太后誉为「顶得上山西省藩库」的大票号。古城中央，金井楼下，协同庆钱庄博物馆以精美的建筑、独特的格局、丰富的内容吸引着众多游客慕名而来。协同庆票号旧址建筑风格新颖别致，集楼、房、亭、窑于一身，可谓平遥古城内明清店铺院落的缩影。现有展室30个，2008年，协同庆博物馆被评为国家AAAA级景区。",
      },
      {
        id: 5,
        image: img(2, 5),
        title: "中国镖局博物馆",
        subtitle: "明末清初镖局旧址，展示了中国镖局发展史",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "中国镖局博物馆位于平遥古城南大街61号，是明末清初镖局旧址，展示了中国镖局发展史，以及中国十大镖局、十大镖师走镖过程，为研究形意拳、长拳、弹腿、长枪等武术套路的发展，提供了实物资料，有一定的研究参考价值。2006年6月北京电视台《印象》栏目「镖行天下」在中国镖局博物馆进行拍摄，2006年8月，中国镖局博物馆被平遥县宋氏形意拳协会确定为训练基地。",
      },
      {
        id: 6,
        image: img(2, 6),
        title: "景区汉服体验馆",
        subtitle: "在古城穿古装，穿越时空的体验",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥古城景区汉服体验馆于2019年在古城西大街（原物资局院内）筹备开馆，是一家以汉服租赁为主的汉服体验平台，馆内面积约达300平方米，有唐、宋、明、魏晋、清等朝代不同风格服饰300余款，馆内还设有琴、棋、书、画、茶室、婚房等多个具有古代元素的拍摄场景，来增强历史时代感，同时还可以预约穿汉服来「平遥古城」这座具有2800多年古文明的建筑中边游玩，边拍摄，来增强历史的场景感。",
      },
      {
        id: 7,
        image: img(2, 7),
        title: "平遥科技艺术馆",
        subtitle: "SoReal焕真平遥科技艺术馆智慧旅游沉浸式体验新空间",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "该馆总占地面积约三千余平方米。共八个主题区域，公共区域、漫步云桥、光阴流逝、泗水归堂、光影秀、VR影院、画展区、茶文化体验区。每个区域各代表一个空间维度，每个空间都与光影有关，利用投影机融合技术、多媒体互动投影技术、水流控制系统、激光灯图案投影同步技术及VR\\AR 等先进高新科技，为历史人文的平遥古城增添当代艺术色彩，通过参观、体验、互动，不断穿梭于虚拟、现实的交替中，感受千年传统与现代科技的融合。整个科技馆应用高新科技、新艺术展示形式进行平遥历史文化的输出和平遥文化底蕴的展示，吸引年轻一代到访，助力平遥传统历史文化在年轻群体之间的传播，已成为平遥古城的网红打卡地。",
      },
      {
        id: 8,
        image: img(2, 8),
        title: "日昇昌票号",
        subtitle: "创立于公元1823年，是中国首家票号",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "中国票号博物馆（日昇昌票号）位于平遥古城西大街南侧原日昇昌票号旧址，日昇昌票号创立于公元1823年，是中国首家票号，被人们称为「中国银行的乡下鼻祖」，是中国金融发展史上的里程碑，具有划时代的意义。三年之后1826年，「日昇昌」在中国多个省份先后设立分支机构。19世纪40年代，它的业务更进一步扩展到日本、新加坡、俄罗斯等国家。当时在「日昇昌」票号的带动下，平遥的票号业发展迅猛，一度成为中国金融业的中心。即使到现在对于经营管理仍有极其重要的现实借鉴意义。日昇昌票号作为全国重点文物保护单位是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 9,
        image: img(2, 9),
        title: "平遥县衙",
        subtitle: "与城隍庙对称布置，分司县治阴、阳两界之职责",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥县衙始建于元至正六年（1346年），除少量元代建筑外，大部分为明代万历年间重修，属明清规制。规模宏大完整，由牌楼、仪门、六部、牢狱、大堂、二堂、大仙楼、内宅、花园等组成，与城隍庙对称布置，分司县治阴、阳两界之职责，为封建王朝县级建制典型代表。平遥县衙保留下来的明清时期大量实物及档案资料，为研究中国古代政治、经济、文化提供了难得的依据和实证。",
      },
      {
        id: 10,
        image: img(2, 10),
        title: "双林寺",
        subtitle: "汉化佛寺，佛像题材融合了佛教的不同宗派",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "双林寺坐落于平遥古城西南6公里的桥头村，「汉文帝为代王都于此」，故原名「中都寺」，北宋时期更名为「双林寺」。是世界文化遗产平遥古城的重要组成部分。双林寺，一座汉化佛寺，佛像题材已融合了佛教的不同宗派，彩塑人物的面相和装束，鲜有古印度的风情，而殿堂的配置更深具中国特色。寺内唐槐、宋碑、明钟，均属稀世珍宝；2052尊彩塑形态各异，极具神韵。古代壁画异彩纷呈，飘逸俊美。",
      },
    ],
    flashPositions: FLASH_POSITIONS_R2,
  },
  3: {
    routeId: 3,
    title: "东门出发二日游",
    scenes: [
      {
        id: 1,
        image: img(3, 1),
        title: "平遥古城墙北门入口",
        subtitle: "明洪武三年（1370年）扩建、改造而成，现周长6.4千米的砖石城墙",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "现周长6.4千米的砖石城墙为明洪武三年（1370年）扩建、改造而成。外观略呈方形，东、西、北三面俱直，唯南墙蜿蜓，形似「神龟」，真是「龟前戏水，山水朝阳，城之修建，依此为胜」。古城墙的历史文化和军事防御功能体现了明清时期中国北方城池典型特点，承载厚重的历史文明，是世界文化遗产平遥古城的重要组成部分。城墙环城有3000个垛口，72座敌楼，寓意孔子「三千弟子，七十二贤人」的历史典故，在庞大的军事设施上体现了浓厚的儒家思想。平遥古城是一部用秦砖汉瓦写就得千年古书，每一条砖缝里都浓缩着历史的记忆，是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 2,
        image: img(3, 2),
        title: "二郎庙",
        subtitle: "专门供奉二郎神的道教庙宇",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥古城二郎庙是专门供奉二郎神的道教庙宇，它始建于清代。整座庙宇坐西朝东，共三进院落，面积约3000多平方米，由正殿、玉皇殿、列宿殿、东岳殿等十余座殿堂组成。这座气势宏大、结构严谨的庙宇，显示出庄严穆的气氛，在我国祠庙建筑中堪称珍品。",
      },
      {
        id: 3,
        image: img(3, 3),
        title: "日昇昌票号",
        subtitle: "创立于公元1823年，是中国首家票号",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "中国票号博物馆（日昇昌票号）位于平遥古城西大街南侧原日昇昌票号旧址，日昇昌票号创立于公元1823年，是中国首家票号，被人们称为「中国银行的乡下鼻祖」，是中国金融发展史上的里程碑，具有划时代的意义。三年之后1826年，「日昇昌」在中国多个省份先后设立分支机构。19世纪40年代，它的业务更进一步扩展到日本、新加坡、俄罗斯等国家。当时在「日昇昌」票号的带动下，平遥的票号业发展迅猛，一度成为中国金融业的中心。即使到现在对于经营管理仍有极其重要的现实借鉴意义。日昇昌票号作为全国重点文物保护单位是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 4,
        image: img(3, 4),
        title: "平遥科技艺术馆",
        subtitle: "SoReal焕真平遥科技艺术馆智慧旅游沉浸式体验新空间",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "该馆总占地面积约三千余平方米。共八个主题区域，公共区域、漫步云桥、光阴流逝、泗水归堂、光影秀、VR影院、画展区、茶文化体验区。每个区域各代表一个空间维度，每个空间都与光影有关，利用投影机融合技术、多媒体互动投影技术、水流控制系统、激光灯图案投影同步技术及VR\\AR 等先进高新科技，为历史人文的平遥古城增添当代艺术色彩，通过参观、体验、互动，不断穿梭于虚拟、现实的交替中，感受千年传统与现代科技的融合。整个科技馆应用高新科技、新艺术展示形式进行平遥历史文化的输出和平遥文化底蕴的展示，吸引年轻一代到访，助力平遥传统历史文化在年轻群体之间的传播，已成为平遥古城的网红打卡地。",
      },
      {
        id: 5,
        image: img(3, 5),
        title: "平遥县衙",
        subtitle: "与城隍庙对称布置，分司县治阴、阳两界之职责",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥县衙始建于元至正六年（1346年），除少量元代建筑外，大部分为明代万历年间重修，属明清规制。规模宏大完整，由牌楼、仪门、六部、牢狱、大堂、二堂、大仙楼、内宅、花园等组成，与城隍庙对称布置，分司县治阴、阳两界之职责，为封建王朝县级建制典型代表。平遥县衙保留下来的明清时期大量实物及档案资料，为研究中国古代政治、经济、文化提供了难得的依据和实证。",
      },
      {
        id: 6,
        image: img(3, 6),
        title: "中国镖局博物馆",
        subtitle: "明末清初镖局旧址，展示了中国镖局发展史",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "中国镖局博物馆位于平遥古城南大街61号，是明末清初镖局旧址，展示了中国镖局发展史，以及中国十大镖局、十大镖师走镖过程，为研究形意拳、长拳、弹腿、长枪等武术套路的发展，提供了实物资料，有一定的研究参考价值。2006年6月北京电视台《印象》栏目「镖行天下」在中国镖局博物馆进行拍摄，2006年8月，中国镖局博物馆被平遥县宋氏形意拳协会确定为训练基地。",
      },
    ],
    flashPositions: FLASH_POSITIONS_R3,
  },
  4: {
    routeId: 4,
    title: "西门出发二日游",
    scenes: [
      {
        id: 1,
        image: img(4, 1),
        title: "迎薰门",
        subtitle: "迎纳东南方的和薰之风",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "现周长6.4千米的砖石城墙为明洪武三年（1370年）扩建、改造而成。外观略呈方形，东、西、北三面俱直，唯南墙蜿蜓，形似「神龟」，真是「龟前戏水，山水朝阳，城之修建，依此为胜」。古城墙的历史文化和军事防御功能体现了明清时期中国北方城池典型特点，承载厚重的历史文明，是世界文化遗产平遥古城的重要组成部分。城墙环城有3000个垛口，72座敌楼，寓意孔子「三千弟子，七十二贤人」的历史典故，在庞大的军事设施上体现了浓厚的儒家思想。平遥古城是一部用秦砖汉瓦写就得千年古书，每一条砖缝里都浓缩着历史的记忆，是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 2,
        image: img(4, 2),
        title: "文庙",
        subtitle: "全国现存最早的文庙",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥文庙学宫是全国现存最早的文庙，是国学圣地，在这里能感受到浓浓的孔子文化和儒学文化。文庙位于平遥古城城隍庙街北侧，始建于金大定三年（1163年），南北中轴线上有棂星门，泮池、大成殿、明伦堂、尊经阁、敬一亭、东西厢房有时习斋，日新斋；建筑艺术高超，殿宇宏敞，层次有致，是全国各地孔庙中最早的且唯一的宋代建筑。平遥文庙历史悠久，规模宏大、气势雄伟、形制典型，是我国华北地区保存最完整、规模最大、最具特色的一座孔庙。作为世界文化遗产——平遥古城的重要组成部分、全国重点文物保护单位，其建设选址、建筑风格、殿堂配置是儒家礼制思想在建筑上的集中反映。",
      },
      {
        id: 3,
        image: img(4, 3),
        title: "平遥县衙",
        subtitle: "与城隍庙对称布置，分司县治阴、阳两界之职责",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "平遥县衙始建于元至正六年（1346年），除少量元代建筑外，大部分为明代万历年间重修，属明清规制。规模宏大完整，由牌楼、仪门、六部、牢狱、大堂、二堂、大仙楼、内宅、花园等组成，与城隍庙对称布置，分司县治阴、阳两界之职责，为封建王朝县级建制典型代表。平遥县衙保留下来的明清时期大量实物及档案资料，为研究中国古代政治、经济、文化提供了难得的依据和实证。",
      },
      {
        id: 4,
        image: img(4, 4),
        title: "日昇昌票号",
        subtitle: "创立于公元1823年，是中国首家票号",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "中国票号博物馆（日昇昌票号）位于平遥古城西大街南侧原日昇昌票号旧址，日昇昌票号创立于公元1823年，是中国首家票号，被人们称为「中国银行的乡下鼻祖」，是中国金融发展史上的里程碑，具有划时代的意义。三年之后1826年，「日昇昌」在中国多个省份先后设立分支机构。19世纪40年代，它的业务更进一步扩展到日本、新加坡、俄罗斯等国家。当时在「日昇昌」票号的带动下，平遥的票号业发展迅猛，一度成为中国金融业的中心。即使到现在对于经营管理仍有极其重要的现实借鉴意义。日昇昌票号作为全国重点文物保护单位是世界文化遗产平遥古城的重要组成部分。",
      },
      {
        id: 5,
        image: img(4, 5),
        title: "平遥科技艺术馆",
        subtitle: "SoReal焕真平遥科技艺术馆智慧旅游沉浸式体验新空间",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "该馆总占地面积约三千余平方米。共八个主题区域，公共区域、漫步云桥、光阴流逝、泗水归堂、光影秀、VR影院、画展区、茶文化体验区。每个区域各代表一个空间维度，每个空间都与光影有关，利用投影机融合技术、多媒体互动投影技术、水流控制系统、激光灯图案投影同步技术及VR\\AR 等先进高新科技，为历史人文的平遥古城增添当代艺术色彩，通过参观、体验、互动，不断穿梭于虚拟、现实的交替中，感受千年传统与现代科技的融合。整个科技馆应用高新科技、新艺术展示形式进行平遥历史文化的输出和平遥文化底蕴的展示，吸引年轻一代到访，助力平遥传统历史文化在年轻群体之间的传播，已成为平遥古城的网红打卡地。",
      },
      {
        id: 6,
        image: img(4, 6),
        title: "华北第一镖局博物馆",
        subtitle: "全国第一家全面展示镖局文化的博物馆",
        openTime: "开放时间：08:00-17:30",
        duration: "建议游玩时长：1 小时",
        detail:
          "华北第一镖局博物馆，是全国第一家全面展示镖局文化的博物馆，占地面积1000余平方米，共三进院落，前院为商业区，包括东西柜房、金库及柜头房，是镖局的业务场所，中院为办公区、由信房、账房及中厅三组建筑组成，是镖局的办公场所，后院为祖师堂，厨房及练武场，是镖师日常生活及练拳习武的地方。华北第一镖局博物馆全面展示了镖局的历史沿革，组织机构和经营管理，为研究中国的经济发展提供了良好的历史借鉴。",
      },
    ],
    flashPositions: FLASH_POSITIONS_R4,
  },
};

function useLockScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function Welcome({ onStart }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [poetryStage, setPoetryStage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setPoetryStage(1), 400);
    const t2 = setTimeout(() => setPoetryStage(2), 400 + 1500 + 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className="travel-route travel-route--welcome">
      <div
        className="travel-route__welcomeBg"
        style={{ backgroundImage: `url(${WELCOME_BG})` }}
      />

      <div className="travel-route__poetry">
        <div
          className={`travel-route__poetry-col travel-route__poetry-col--first${poetryStage >= 1 ? " visible" : ""}`}
        >
          <span>古愁莽莽集平遥</span>
          <span>雁断虚空梦寂寥</span>
        </div>
        <div
          className={`travel-route__poetry-col travel-route__poetry-col--second${poetryStage >= 2 ? " visible" : ""}`}
        >
          <span>风满吟襟尘满面</span>
          <span>不因醉酒也魂销</span>
        </div>
      </div>

      <div
        className={`travel-route__sideDesc${poetryStage >= 2 ? " visible" : ""}`}
      >
        <h3 className="travel-route__sideDescTitle">迎薰门</h3>
        <p className="travel-route__sideDescText">
          平遥古城正南之门，取“南风之薰，可以解吾民之愠”之意，城门巍峨雄峙，青砖黛瓦映着岁月流光。
        </p>
        <p className="travel-route__sideDescText">
          古时晋商驼铃自远方来，多由此入城，携万里财货，纳四方和风。城楼翘角飞檐，气势庄重，既守一城安宁，亦迎朝暮清风与八方来客，在千年烟火里，静静诉说着古城的温厚与繁华。
        </p>
      </div>

      {!showRoutePanel && (
        <>
          <button
            type="button"
            className="travel-route__openRouteBtn"
            onClick={() => setShowRoutePanel(true)}
          >
            选择游览路线
          </button>
          <button
            type="button"
            className="travel-route__openRouteBtn travel-route__openHistoryBtn"
            onClick={() => navigate("/timeline")}
          >
            了解古城历史
          </button>
        </>
      )}

      {showRoutePanel && (
        <div
          className="travel-route__panelOverlay"
          onClick={() => setShowRoutePanel(false)}
        >
          <div
            className="travel-route__welcomeCard"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="travel-route__panelClose"
              onClick={() => setShowRoutePanel(false)}
              aria-label="关闭"
            >
              ×
            </button>

            <h1 className="travel-route__welcome-title">
              尊敬的游客，欢迎您来到平遥古城，请在下方选择您的旅游线路
            </h1>

            <form
              className="travel-route__welcomeForm"
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedRoute) return;
                playBgm();
                onStart(selectedRoute);
              }}
            >
              <div className="travel-route__radioList">
                {ROUTE_LABELS.map((r) => (
                  <label key={r.id} className="travel-route__radioItem">
                    <input
                      type="radio"
                      name="route"
                      checked={selectedRoute === r.id}
                      onChange={() => setSelectedRoute(r.id)}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>

              <button
                className="travel-route__startBtn"
                type="submit"
                disabled={!selectedRoute}
              >
                开始游览
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function TravelRouteMap({
  routeId,
  onBackToWelcome,
  onOpenSceneDetail,
  onOpenScenePopup,
}) {
  const data = routeData[routeId];
  const scenes = data.scenes;
  const [unlockedScenes, setUnlockedScenes] = useState(1);
  const [flyingFlash, setFlyingFlash] = useState(null);
  const [newestUnlocked, setNewestUnlocked] = useState(1);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [detailPageOpacity, setDetailPageOpacity] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [showDetailCard, setShowDetailCard] = useState(true);

  useLockScroll(Boolean(showDetailPage));

  const activeScene = useMemo(
    () => scenes.find((s) => s.id === activeSceneId) ?? null,
    [scenes, activeSceneId],
  );

  useEffect(() => {
    setUnlockedScenes(1);
    setNewestUnlocked(1);
    setActiveSceneId(null);
    setShowDetailPage(false);
    setDetailPageOpacity(0);
    setFlyingFlash(null);
    setShowAll(false);
    setShowFullDetail(false);
    setShowDetailCard(true);
    playBgm();
  }, [routeId]);

  const closePopup = useCallback(() => {
    setActiveSceneId(null);
  }, []);

  const showMoreDetail = useCallback(() => {
    if (!activeScene) return;
    playOneShot(DETAIL_SOUND_URL, 0.5);
    setShowDetailPage(true);
    setShowFullDetail(false);
    setShowDetailCard(true);
    setDetailPageOpacity(0);
    setTimeout(() => setDetailPageOpacity(1), 50);
    onOpenSceneDetail?.(activeScene.id);
  }, [activeScene, onOpenSceneDetail]);

  const backToMap = useCallback(() => {
    setDetailPageOpacity(0);
    setTimeout(() => {
      setShowDetailPage(false);
      setActiveSceneId(null);
      setShowFullDetail(false);
      setShowDetailCard(true);
    }, 2500);
  }, []);

  const unlockNextScene = useCallback(() => {
    const nextIdx = unlockedScenes;
    if (nextIdx >= scenes.length) return;

    const fromPos = data.flashPositions[unlockedScenes - 1];
    const toPos = data.flashPositions[nextIdx];
    if (!fromPos || !toPos) return;

    const nextId = scenes[nextIdx].id;
    setFlyingFlash({
      id: nextId,
      fromLeft: fromPos.left,
      fromTop: fromPos.top,
      toLeft: toPos.left,
      toTop: toPos.top,
    });

    setTimeout(() => {
      setUnlockedScenes((v) => Math.min(v + 1, scenes.length));
      setNewestUnlocked(nextId);
      setFlyingFlash(null);
    }, 1400);
  }, [unlockedScenes, scenes, data.flashPositions]);

  const handleShowAll = useCallback(() => {
    setShowAll(true);
    setUnlockedScenes(scenes.length);
    setNewestUnlocked(null);
  }, [scenes.length]);

  const visibleCount = showAll ? scenes.length : unlockedScenes;

  return (
    <section className="travel-route travel-route--map">
      <div className="travel-route__mapBlurBg" />
      <div className="travel-route__mapWrap">
        <img className="travel-route__mapBg" src={MAP_IMG} alt="map" />

        {scenes.map((s, idx) => {
          const pos = data.flashPositions[idx];
          const isUnlocked = s.id <= visibleCount;
          if (!pos || !isUnlocked) return null;
          if (flyingFlash && flyingFlash.id === s.id) return null;

          const isNewest = s.id === newestUnlocked;

          return (
            <img
              key={s.id}
              className={`travel-route__flash${isNewest ? " travel-route__flash--newest" : ""}`}
              style={{ left: pos.left, top: pos.top }}
              onClick={() => {
                setBgmVolume(0.1);
                playOneShot(CLICK_SOUND_URL, 0.75);
                setTimeout(() => setBgmVolume(0.3), 1000);
                setActiveSceneId(s.id);
                onOpenScenePopup?.(s.id);
              }}
              src={FLASH_IMG}
              alt={`光圈${s.id}`}
            />
          );
        })}

        {flyingFlash && (
          <img
            className="travel-route__flash travel-route__flash--flying"
            style={{
              "--flash-from-left": flyingFlash.fromLeft,
              "--flash-from-top": flyingFlash.fromTop,
              "--flash-to-left": flyingFlash.toLeft,
              "--flash-to-top": flyingFlash.toTop,
              left: flyingFlash.fromLeft,
              top: flyingFlash.fromTop,
            }}
            src={FLASH_IMG}
            alt="飞行光圈"
          />
        )}

        {!showAll && unlockedScenes < scenes.length && !flyingFlash ? (
          <button
            type="button"
            className="travel-route__unlockBtn"
            onClick={unlockNextScene}
          >
            解锁下一景点
          </button>
        ) : null}

        {activeScene ? (
          <div className="travel-route__popup">
            <div className="travel-route__popupCard">
              <button
                type="button"
                className="travel-route__popupClose"
                onClick={closePopup}
              >
                ×
              </button>

              <div className="travel-route__popupImgWrap">
                <img
                  className="travel-route__popupImg"
                  src={activeScene.image}
                  alt={activeScene.title}
                />
              </div>

              <div className="travel-route__popupBody">
                <h3 className="travel-route__popupTitle">
                  {activeScene.title}
                </h3>
                <p className="travel-route__popupSub">{activeScene.subtitle}</p>
                <p className="travel-route__popupMeta">
                  {activeScene.openTime}
                </p>
                <p className="travel-route__popupMeta">
                  {activeScene.duration}
                </p>

                <div className="travel-route__popupMoreRow">
                  <button
                    type="button"
                    className="travel-route__popupMoreBtn"
                    onClick={showMoreDetail}
                  >
                    点击此处了解更多
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showDetailPage && activeScene
          ? (() => {
              const chars = activeScene.detail.split("");
              return (
                <div
                  className="travel-route__detailOverlay"
                  style={{ opacity: detailPageOpacity }}
                >
                  <div
                    className="travel-route__detailBg"
                    style={{ backgroundImage: `url(${activeScene.image})` }}
                  />
                  <div className="travel-route__detailShade" />

                  <div className="travel-route__detailContent">
                    <button
                      type="button"
                      className="travel-route__detailBackBtn"
                      onClick={backToMap}
                    >
                      返回
                    </button>

                    <div className="travel-route__detailToolbar">
                      {showDetailCard && !showFullDetail && (
                        <button
                          type="button"
                          className="travel-route__detailShowAll"
                          onClick={() => setShowFullDetail(true)}
                        >
                          显示全文
                        </button>
                      )}
                      <button
                        type="button"
                        className="travel-route__detailToggleCard"
                        onClick={() => setShowDetailCard((v) => !v)}
                      >
                        {showDetailCard ? "收起文字" : "展开文字"}
                      </button>
                    </div>

                    <div
                      className={`travel-route__detailCard${showDetailCard ? "" : " travel-route__detailCard--hidden"}`}
                    >
                      <div className="travel-route__detailTextBox">
                        {showFullDetail ? (
                          <p className="travel-route__detailText travel-route__detailText--full">
                            {activeScene.detail}
                          </p>
                        ) : (
                          <p className="travel-route__detailText travel-route__detailText--anim">
                            {chars.map((ch, idx) => (
                              <span
                                key={idx}
                                className="travel-route__detailChar"
                                style={{ animationDelay: `${idx * 0.06}s` }}
                              >
                                {ch}
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          : null}

        <button
          type="button"
          className="travel-route__backTopBtn"
          onClick={onBackToWelcome}
        >
          返回线路选择
        </button>

        <div className="travel-route__mapHint">
          当前浮动的景点为您需要前往的景点，在浏览完此处景点后可点击屏幕右下方按钮显示下一景点，您也可
          <span className="travel-route__mapHintLink" onClick={handleShowAll}>
            点击此处
          </span>
          显示当前路线所有景点。
        </div>
      </div>
    </section>
  );
}

export default function TravelRouteModule() {
  const [routeId, setRouteId] = useState(null);

  return routeId ? (
    <TravelRouteMap
      routeId={routeId}
      onBackToWelcome={() => setRouteId(null)}
      onOpenSceneDetail={() => {}}
      onOpenScenePopup={() => {}}
    />
  ) : (
    <Welcome onStart={setRouteId} />
  );
}
