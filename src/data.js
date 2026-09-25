// Fictional examples, never actual people, companies or addresses.
export const demoLandlords = [
 {id:'demo-maple',name:'Maple House · 枫叶公寓',city:'Toronto',district:'市中心 · 示例街区',demo:true},
 {id:'demo-north',name:'Northline · 北岸租赁',city:'Toronto',district:'北区 · 示例街区',demo:true},
 {id:'demo-cedar',name:'Cedar Living · 雪松居所',city:'Markham',district:'西区 · 示例街区',demo:true},
 {id:'demo-park',name:'Parkside · 公园里',city:'Mississauga',district:'大学区 · 示例街区',demo:true},
];
const fixture=(id,landlord_id,s,again,title,body,year,created_at)=>({id,landlord_id,maintenance:s[0],communication:s[1],deposit:s[2],again,title,body,year,created_at,status:'published',demo:true});
export const demoReviews = [
 fixture('sample-1','demo-maple',[5,5,4],1,'维修及时，沟通也很顺畅','这是虚构的示例评价。厨房水龙头报修后，第二天就有人来处理。搬出时的清洁要求提前说明了，整体体验比较省心。',2025,1754006400000),
 fixture('sample-2','demo-maple',[4,5,5],1,'租住一年，整体很安心','这是虚构的示例评价。管理人员回复及时，日常维护安排清楚。退租交接也按事先约定的流程完成。',2024,1748736000000),
 fixture('sample-3','demo-north',[3,4,3],0,'位置方便，维修还可以更快','这是虚构的示例评价。沟通比较礼貌，但冬天暖气维修等了几天。希望管理方能更及时地说明处理进度。',2025,1751328000000),
 fixture('sample-4','demo-cedar',[5,4,5],1,'入住和退租都有清晰说明','这是虚构的示例评价。交接时一起检查了房屋状况，也记录了已有的小问题。后续有疑问都能得到回复。',2025,1756684800000),
 fixture('sample-5','demo-park',[2,3,2],0,'希望费用说明更透明','这是虚构的示例评价。公共区域维修等待较久，退租时对清洁标准理解不一致。如果一开始有书面清单会更好。',2024,1746057600000),
];
