# Rate My Landlord · Toronto & GTA

从地图找到楼宇，再按 **Unit → 房东 → 租住评价** 查询。中文界面，适配电脑和手机。

## 功能

- GTA 交互地图：Toronto、Mississauga、Markham、Vaughan、Brampton、Richmond Hill、Oakville、Pickering 快捷定位。
- 按门牌、街道或楼盘名称搜索；点击地图可获取就近地址，添加前需核对门牌。
- 楼宇与 Unit 精确匹配。同楼不同 Unit 可以对应不同房东，同一 Unit 号码在不同楼宇互不混淆。
- 用户可以补充「出租楼宇 + Unit + 房东直租 / 通过中介」资料，无需输入姓名；所有关系标注未经产权核验。
- 针对指定 Unit 的维修、沟通、押金评分与评价，不混入其他 Unit 的评分。
- 房东目录、城市筛选、评分排序、匿名评价、举报和管理员审核。
- 评价审核前不公开、不计入分数。数据保存在 SQLite（本地）或 D1（托管），不用浏览器存储冒充数据库。

## 数据说明

地图初始没有真实房东或 Unit 数据。地图和地址服务**不提供产权登记或房东身份**，用户需要贡献已知的对应关系。

目录中四位带「示例」标记的出租方及其评价完全虚构，不在地图上伪装成真实房东。正式收录资料会明确标注为用户提供、未经核验。

每个楼宇 / Unit 当前只保留一条出租方关系。第一版没有租约认证、房东变更历史或住户身份验证；公开推广前需要完善关系纠错与历史记录流程。

## 本地启动

安装 Node.js 24（或支持 `node:sqlite` 的 Node.js 22.13+），然后：

```sh
node scripts/dev.mjs
```

访问 `http://localhost:3000`。首次启动自动创建 `data/landlords.sqlite` 并应用迁移；重新启动保留数据。启动和测试不需要安装第三方运行依赖。

可选环境变量：`PORT`（默认 3000）、`ADMIN_TOKEN`（足够长的随机密钥）。启动器只监听本机；生产环境使用下方 Worker 构建。

## 审核

在服务端配置 `ADMIN_TOKEN`，打开 `/admin.html` 输入密钥，可查看待审核评价、公开或拒绝评价、查看举报及撤下被举报的用户评价。密钥只保留在当前页面内存中。

没有配置密钥时管理接口默认拒绝访问。不要将真实密钥写进源码、README、GitHub 或浏览器存储。`.env.example` 只列出变量；启动器不会自动读取 `.env`，需要由启动环境注入。

示例评价属于静态演示数据，管理员无法通过数据库接口移除；要移除示例请编辑 `src/data.js`。

## 验证与构建

```sh
node --test tests/*.test.mjs
node --check public/app.js
node --check public/map.js
node scripts/build.mjs
node scripts/validate-artifact.mjs
```

GitHub Actions 会在 push / pull request 时运行检查。自动测试覆盖评分、审核、重复提交、跨站请求、楼宇 / Unit 隔离、错误关联拒绝和举报等流程。

本地浏览器检查覆盖了真实地图加载、地址搜索、新增 Unit 与出租方、提交该 Unit 的评价、目录搜索以及手机宽度。WebMCP 工具采用能力检测，常规浏览器不支持时不影响使用；尚未在原生 WebMCP 环境中验证。

构建生成 `dist/server/index.js`，导出 Cloudflare Workers 兼容的 `fetch(request, env)`。HTML / CSS / JavaScript 打包进 Worker；`.openai/hosting.json` 声明 D1 `DB` 绑定，数据库迁移位于 `drizzle/` 并复制到 `dist/.openai/drizzle/`。Sites 的版本发布流程负责应用迁移。

GitHub 仓库存放源码；**GitHub Pages 单独不能运行这个版本的数据库和审核接口**。托管完整功能需要 Worker + D1，或自行配置 Node 服务和持久化数据库。

## 修改数据库结构

数据库定义在 `db/schema.ts`。安装开发依赖后生成新的迁移，勿改写已经上线的迁移：

```sh
pnpm install --ignore-scripts
pnpm db:generate
```

## 外部服务与限制

- 地图：[Leaflet 1.9.4](https://leafletjs.com/)（本地 vendor，许可证随代码提供）。
- 地图数据与底图：[OpenStreetMap](https://www.openstreetmap.org/copyright)，保留可见署名，遵守 [tile usage policy](https://operations.osmfoundation.org/policies/tiles/)。
- 地址搜索：[Photon 公共服务](https://github.com/komoot/photon)。输入停顿 450 毫秒后获取地址推荐，支持取消旧请求、缓存与键盘选择；用户提交搜索或点击定位也会请求；公共服务有公平使用限制且无可用性承诺。访问量增长时应换成自建或有配额保障的服务。
- 匿名 Cookie 用于基本重复检测和提交频率限制，数据库保存其哈希；它不是身份核验，可被清除或更换浏览器绕过。面向公众推广前应接入可靠登录 / 租住验证、服务端反滥用和更完整的审核运营。
- 地图结果仅用于定位。街道级结果和反向查询地址可能不精确，需要用户确认门牌。
- 目前以小规模 MVP 为目标，地图一次读取已收录楼宇；大量数据时需要视口查询、分页和聚合。

## 目录

```text
public/       地图、搜索、房东详情与审核界面
src/          楼宇 / Unit API 与明确标注的演示资料
worker/       API、评分、校验、安全响应头
db/           数据库结构
drizzle/      可追踪的数据库迁移
scripts/      本地运行、SQLite 适配、构建与校验
tests/        核心行为测试
```

## 楼宇图层

`public/buildings.json` 为 OpenStreetMap 公开公寓楼位置快照，使用 ODbL 1.0，另附有来源链接的少量楼盘信息校正。缩小时聚合，放大后显示楼宇；数字是楼宇数，不是出租挂牌数。仅明确识别的 condo 使用金色，其余标为公寓 / 住宅楼。覆盖取决于源数据，不承诺收录全部 condo。运行 `node scripts/import-buildings.mjs` 可重新导入。

房大师公开页面有大量登录后可见的房源，当前没有可靠的逐栋完整挂牌统计，因此不显示租赁热度排名。楼宇图层不提供 Unit 或房东身份，评价仍由用户贡献。50 Charles St E 的邮编按项目所有者确认修正为 M4Y 0C3；未经确认的搜索服务邮编不展示。

租赁方式按 Unit 保存；旧资料显示“租赁方式未补充”，不猜测其方式。新 Unit 不因选择相同方式而合并房东或评分。

地图近景使用真实 OpenStreetMap 楼体轮廓：悬停时描边并显示最多两行楼名 / 地址，点按可进入 Unit。无名称且地址不完整的记录不显示。`node scripts/import-footprints.mjs` 更新轮廓，须在楼宇资料导入后运行。
目录与每条评价展示楼宇地址、Unit 和房东评价对象；从目录提交时保留 Unit 关联。
