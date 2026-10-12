# Cloudasta Agentic RAG 演示逐字稿

预计时长：10–12 分钟。讲解语言为中文，界面与查询使用英文。方括号内是操作提示，不需要读出来。

## 演示前准备（不朗读）

- 打开 http://127.0.0.1:4173/，使用现有已经完成的 Qwen 分析结果。
- 不点击 Reset demo files 或 Rebuild full index，它们会清空治理结果。也不需要现场重新跑完整任务；本轮真实分析用了约 14 分 37 秒。
- 当前基准状态：30 份已分析、5 份 Processed、26 条待审核决定。审核数量和处理数量不是同一个统计口径。
- 问答时选择 Live Qwen agent；客户范围按文稿切换；Historical evidence 默认不勾选。实时问答有网络等待，可趁此解释引用机制。
- 主流程只查看，不批准文件。文末另有可选的人工批准演示，会改变当前状态，建议放在最后。
- 目前“全局标准价格”查询存在已记录的假冲突，不应演示为成功案例；客户特定价格有实测通过的案例。

## 1. 开场：这个系统解决什么问题（约 45 秒）

[打开 Overview。]

大家好，我今天演示的是一个面向企业内部知识管理的 Agentic RAG 系统。

企业里的问题通常是：资料一直在增加，但是旧文件不会自动消失。一份 SOP 可能已经更新了，同事却还在转发旧版本；一个会议里讨论的新价格，也可能被误当成已经批准的价格。

所以我希望这个系统能回答两个问题：第一，这些文件之间到底是什么关系？第二，回答业务问题时，究竟应该引用哪一份、哪一段内容？

这里所有文件都是模拟生成的，没有连接真实邮箱或公司资料。系统只有管理员一个角色。这一轮已经通过真实千问模型分析了 30 份文件，下面我直接展示实际处理结果。

## 2. 架构：文件如何变成可信答案（约 90 秒）

[停留在 Overview，指向文件数量和 105 个 chunks。]

整个架构可以顺着一份文件来理解。

第一步是解析和索引。文件进来之后，系统根据格式提取内容，再切成可以定位回原文的 chunks。例如 Word 会保留章节位置，PowerPoint 会提取幻灯片和备注，Excel 会保留工作表、行列和单元格位置。

所有可解析文件都先进入检索索引，包括草稿和旧版，因为 agent 比较版本时也需要看到它们。但是，进入索引不代表它已经可以用于回答。

第二步是 agent 分析。系统按业务日期从新到旧处理文件。千问负责阅读内容、选择工具、检索相关旧文件，然后提出关系建议。比如：这是一份重复副本，这份文件完全替代旧版，或者只更新了一个条款。

检索有两个通道：关键词检索负责找明确的术语和编号，语义检索负责找意思相近的内容。目前向量部分是在本地对这批语料训练的 LSA，使用 20 个语义维度；没有调用千问 embedding 服务。

第三步是治理规则。模型建议不会直接变成执行结果。代码会检查客户范围、批准状态、生效日期、保留要求和条款覆盖。条件明确的更新可以自动执行，无法确认的就进入管理员审核。

最后才是问答。检索先筛出当前批准并生效的条款，再由千问选择直接回答问题的证据。返回的是经过校验的原文引用和出处，而不是一段无法追溯的自由发挥。

技术上，这个 demo 使用浏览器界面、Node.js 服务和本地 SQLite。文件、索引、关系、审核和执行记录都保存在本地；千问通过服务器端接口调用，API Key 不进入浏览器。

## 3. 文件库：不是只有名字的假文件（约 45 秒）

[进入 File library。打开一份 Word SOP，然后关闭详情；也可以下载原文件展示真实格式。]

这批资料一共有五类：SOP、客户 proposal deck、QBR notes、pricing framework 和 Meet transcript。

它们分别使用 Word、PowerPoint、Markdown、Excel 和文本格式，里面有具体的操作流程、交付计划、商业条款和会议讨论。

每份文件还记录是否处理，以及当前处理人。这里要区分两种状态：Processing 是工作流程状态，Knowledge 是知识有效性。比如一份文件已经被新版替代，就不应该再进入当前答案，即使它还有一条待处理的审核任务。

## 4. 案例一：新版 SOP 让旧信息失效（约 90 秒）

[进入 Document lineage。File family 选择 Workspace access procedure | Revision 1.0。点击 Full · ✓ 连线。]

先看一个明确的版本更新。

旧版文件叫 Workspace access procedure，Revision 1.0。它规定，账号应该在批准后的五个工作日内开通。新版 Revision 2.0 把这个目标改成了两个工作日，同时调整了队列检查安排。

所以，这两份文件不是重复文件。它们有实质性的政策变化。

在这里可以看到已确认的 Full replacement 连线。点击连线，可以检查模型为什么建议替代，以及它引用了新旧文件的哪些原文。旧版已经是 Superseded，新版仍然是当前来源。

这次可以自动执行，是因为新版已经批准、已经生效、风险低，而且明确声明了替代关系。系统不是只看“哪个日期更新”就选哪个。

[进入 Ask the knowledge base，Client scope 选择 Global，模式选择 Live Qwen agent，不勾 Historical evidence。输入：]

> How many business days after approval should account provisioning take?

[点击 Find evidence，等待结果。]

这里应该引用 Revision 2.0 的 two business days，也就是两个工作日。我们不仅可以看到答案，还可以打开来源，核对原始位置。

[若时间充足，回到 Document lineage，选择 Backup and recovery operations | Revision 1.0。]

备份 SOP 也是同样的逻辑：旧版要求每周日备份，新版改成每晚备份，恢复演练也从每季度改成每月。旧版同样已经被替代。这说明系统处理的不只是重复文件，也包括已经过时的信息。

## 5. 案例二：去重和历史记录保留（约 60 秒）

[在 Document lineage 选择 Acme QBR notes · Q2，勾选 Show references & duplicates。点击相关连线。]

接下来看看两种很容易混淆的情况。

Acme 有一份 Q2 QBR，以及一份 Q2 shared copy。这两份文件字节一致，所以 shared copy 被识别成 Exact duplicate，并做逻辑归档。原始文件仍然保留，没有永久删除。

但是 Acme 的 Q1 QBR 和 Q2 QBR，虽然标题相似、结构相似，却不能互相替代。它们记录的是不同季度的业务事实，应该 Coexists，也就是共同保留。

这也是为什么不能只靠向量相似度清理文件。相似度可以帮我们找到候选，但“重复”“版本更新”和“不同期间记录”，需要进一步判断。

## 6. 案例三：局部更新为什么要交给管理员（约 75 秒）

[在 Document lineage 选择 Customer onboarding and service acceptance。点击 Partial · ? 连线。]

这份 onboarding SOP 有三个部分：kickoff、security 和 handoff。

现在有一份新 amendment，提出把 kickoff 的安排时间从签约后十个工作日缩短到三个工作日。但它明确说，安全检查和交接流程继续沿用原来的 SOP。

所以它应该是 Partial replacement，只更新 kickoff，不能整份覆盖旧 SOP。版本图上的关系会保留具体的条款范围，也支持一份文件关联多个 parent 或 child，用来表达合并和拆分。

不过，这份 amendment 目前还是草案。因此连线是待审状态，三个工作日还没有进入当前答案。管理员可以从这里查看两边原文，修改关系类型和覆盖条款，也可以驳回这条建议。

[点击 Review evidence，展示审核页面，但不点击 Approve。]

这里的人工作业是有具体依据的：管理员不是简单按一个“相信 AI”的按钮，而是在核对原文、变更范围和批准条件。批准局部替代后，只有 kickoff 切到新版，security 和 handoff 仍然保留旧版有效内容。

## 7. 案例四：新会议、新价格和新提案，不等于已经生效（约 90 秒）

[进入 File library，搜索 pricing-meet，打开 Commercial planning: FY27 managed workspace rates。]

这份 Meet transcript 讨论了新的价格方案。标准价目前是每用户每月 24 美元，新的 Finance draft 提出 28 美元，但会议并没有完成正式批准。

模型可以把会议记录和定价文件关联起来，帮助管理员理解讨论背景，但不能让会议记录直接覆盖正式定价政策。新版 Excel 定价框架目前也仍在审核队列里。

[关闭详情，进入 Review queue，选择 Acme migration proposal · revised 的替代建议。]

同样，Acme 的 PowerPoint 提案从六周交付改成了四周交付。这个变化涉及客户承诺，修订版又尚未批准，因此系统识别出了版本关系，但没有把四周直接当成已经生效的承诺。

再比如有一份已经批准的 incident response 新版，响应目标从四个工作小时缩短到一个小时，但它到 2027 年 1 月 1 日才生效。在生效之前，当前答案仍然应该使用旧政策。

这些案例说明，模型需要同时考虑内容、权威和时间，而不能把“更新的文件”直接理解成“更正确的文件”。

## 8. 案例五：客户隔离和不知道时拒答（约 60 秒）

[进入 Ask the knowledge base。选择 Acme、Live Qwen agent，输入：]

> What is Acme's approved workspace license price per user per month?

[点击 Find evidence，核对 Acme_Approved_Commercial_Schedule_2026.xlsx 的引用。]

Acme 有自己已经批准的商业计划，这里应该引用每用户每月 21 美元。它不会把通用定价草案里的 28 美元，或者 Beta 的客户价混进来。

[可选：切换 Beta，输入下面的问题，结果应引用 Beta 的 USD 23。]

> What is Beta's approved workspace license price per user per month?

[切回 Global，输入：]

> What is the lunar vacation allowance?

这是一个资料里没有的问题。系统应该返回证据不足，而不是编造一项看起来合理的政策。这里的拒答可以在检索阶段发生，并不需要每次都调用模型。

## 9. 执行记录、实测表现和结束（约 60 秒）

[进入 Agent workspace，展开一条当前可见的 keyword_search、semantic_search 或 model_call 记录；然后进入 Activity & recovery。不要执行 Roll back。]

这些记录展示的是实际执行过程：模型选择了什么工具、检索到了什么、提交了什么建议。治理决定也有操作记录，符合版本检查条件时可以回滚，同时保留原始文件。

最后我也说明一下目前的验证结果。这一轮是真实千问运行，不是预先写好的处理结果。30 份文件都完成了分析，预先定义的 12 个关键关系全部命中。

但我不会把它说成百分之百准确。全部替代和去重提议中，有一项判断缺乏依据，所以这类提议是 11 项正确、共 12 项；八个端到端问答测试通过了七个。系统还存在价格假冲突和多余审核任务等问题。

所以现在的定位是一个可运行、可追溯的验证版，还不能直接作为无人审核的生产系统。

这个项目已经把文件处理、agent 推理、治理规则和管理员判断串成了一条完整流程。下一步是扩大独立测试样本、修复误判和审核冗余，再验证它在真实业务规模下是否稳定。

## 可选加演：现场批准局部替代（额外 1–2 分钟）

**此操作会改变当前工作区，并使原评估快照不再代表当前状态。主稿不依赖此操作。**

1. Review queue 中选择 Customer onboarding: kickoff scheduling amendment 对 onboarding-v1 的 Partial supersedes 项。
2. 核对覆盖范围只有 kickoff；在 Decision note 填写 `Demo approval: kickoff clause only; security and handoff remain unchanged.`。
3. 点击 Approve proposed change。这是在模拟管理员完成批准，不是说草案原本已经生效。
4. 回到 Document lineage：应看到该关系变成 Confirmed；旧 SOP 的当前有效条款保留 security、handoff，amendment 提供 kickoff。
5. Ask 页面选择 Global、Live Qwen agent，查询：

   > Within how many business days after signature must we schedule the customer kickoff under the approved procedure?

6. 核对引用变为 amendment 的 three business days。该批准后的实时问答需要现场验证；不要把尚未返回的结果当作已完成测试来讲。

可朗读：

“我现在模拟管理员确认这次修订。批准以后，版本图里的虚线会变成已确认关系。大家注意，变化发生在 kickoff 这个条款上，原来 SOP 的安全检查和交接要求仍然保留。我们再问一次相同的问题，就可以检查回答是否跟随这个治理决定发生了变化。”

## 演示中可能被问到的问题

**为什么不是所有文件都显示 Processed？**

“30 份已经完成分析，但分析完成不等于治理完成。有些还在等待人工决定；另外，目前兜底规则过于保守，给独立文件和旧版本也生成了一些多余确认任务。这是已发现的问题。”

**模型怎么知道批准状态和客户归属？**

“当前来自模拟文件的清单元数据，正文也包含相关信息。系统没有声称能自动验证真实签字或审批系统。接入真实数据后，这些信息需要从可信来源获得。”

**是不是模型自己发现了所有版本关系？**

“没有。这批明确更新案例包含版本编号和 replaces 元数据，模型还会检索并阅读正文比较覆盖范围。它们属于基础验证；没有明确继承声明的复杂过时信息，还需要更独立、更困难的评估。”

**版本图会直接提高准确率吗？**

“它主要提高可解释性和审核效率，让错误更容易发现。真正的准确率还需要独立标注、更多样本和反复测试来证明。”

**为什么没有演示全局标准价格问答？**

“当前冲突检测会把同一条款的互补分段与保留副本误认为冲突，因此会在调用模型前阻断。这个失败已记录，不能用客户特定价格成功来掩盖。”
