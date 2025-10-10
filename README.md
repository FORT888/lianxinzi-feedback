<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>联信资匿名意见箱</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <div class="container">
    <h1>📩 联信资匿名意见箱</h1>
    <p class="desc">完全匿名 · 直达 Outlook · 支持上传证据</p>

    <form id="feedback-form">
      <label for="category">举报内容分类</label>
      <select id="category" name="category" required>
        <option value="">请选择分类</option>
        <option value="公司管理">公司管理</option>
        <option value="团队协作">团队协作</option>
        <option value="工作环境">工作环境</option>
        <option value="福利制度">福利制度</option>
        <option value="其他">其他</option>
      </select>

      <label for="message">举报 / 意见内容</label>
      <textarea id="message" name="message" placeholder="请尽量详细描述事实、时间、地点、涉及人员等信息..." maxlength="1500" required></textarea>

      <label for="evidence">提交证据（可选，单个 ≤ 5MB，可多选）</label>
      <input type="file" id="evidence" name="evidence" multiple>

      <label class="checkbox">
        <input type="checkbox" required>
        我已知悉并确认：本表单不采集姓名、邮箱或登录信息，建议不要在内容中留下可识别个人的线索。
      </label>

      <button type="submit">匿名提交</button>
    </form>

    <p class="footer">© 2025 联信资集团 · 保密与合规</p>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script>
    (function(){
      emailjs.init("Vf3g58_uwsuIfMxCI"); // ← 这里填你的 Public Key
    })();

    const serviceID = "service_0nbyy1m"; // ← 你的 Service ID
    const templateID = "template_la7d6sb"; // ← 你的 Template ID

    document.getElementById('feedback-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = e.target.querySelector("button");
      btn.disabled = true;
      btn.textContent = "正在提交...";

      const files = e.target.evidence.files;
      let fileLinks = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("https://api.emailjs.com/api/v1.0/files/upload", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        fileLinks.push(data.url);
      }

      const formData = {
        category: e.target.category.value,
        message: e.target.message.value,
        evidence: fileLinks.join(", ")
      };

      emailjs.send(serviceID, templateID, formData)
        .then(() => {
          alert("✅ 举报已匿名提交成功！");
          e.target.reset();
        })
        .catch((err) => {
          console.error(err);
          alert("❌ 提交失败，请稍后再试。");
        })
        .finally(() => {
          btn.disabled = false;
          btn.textContent = "匿名提交";
        });
    });
  </script>
</body>
</html>
