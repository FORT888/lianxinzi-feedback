<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>联信资匿名意见箱</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    header, h1:first-of-type { display: none !important; }
    body {
      font-family: 'Noto Sans SC', sans-serif;
      background: radial-gradient(circle at top, #0e1630, #020617);
      color: #fff; margin: 0; padding: 0;
    }
    .container {
      max-width: 600px; margin: 80px auto; background: rgba(255,255,255,0.08);
      padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    h2 { text-align: center; font-weight: 600; margin-bottom: 25px; }
    label { display: block; margin-top: 15px; margin-bottom: 5px; font-weight: 500; }
    select, textarea, input[type="file"] {
      width: 100%; padding: 10px; border-radius: 6px; border: none;
      font-size: 14px; margin-bottom: 15px;
    }
    textarea { resize: vertical; min-height: 100px; }
    button {
      background-color: #2563eb; border: none; color: white; padding: 12px 20px;
      width: 100%; font-size: 16px; border-radius: 6px; cursor: pointer; transition: .2s;
    }
    button:hover { background-color: #1d4ed8; }
    .footer { text-align: center; color: #888; font-size: 14px; margin: 20px 0; }
  </style>
</head>

<body>
  <div class="container">
    <h2>联信资匿名意见箱</h2>

    <form id="feedbackForm">
      <label for="category">反馈内容分类</label>
      <select id="category" name="category" required>
        <option value="">请选择分类</option>
        <option value="公司管理">公司管理</option>
        <option value="团队协作">团队协作</option>
        <option value="线下办事处环境">线下办事处环境</option>
        <option value="福利制度">福利制度</option>
        <option value="其他">其他</option>
      </select>

      <label for="message">举报 / 意见内容</label>
      <textarea id="message" name="message"
        placeholder="请您如实填写宝贵的意见或举报内容，我们会认真核实并及时处理。"
        maxlength="1500" required></textarea>

      <label for="evidence">上传证据（可选，单个≤5MB，可多选）</label>
      <input type="file" id="evidence" name="evidence" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar" />

      <p>
        <input type="checkbox" id="confirm" required />
        我已知悉并确认：本表单不采集姓名、邮箱或登录信息。
      </p>

      <button type="submit" id="submitBtn">匿名提交</button>
      <p id="status" style="margin-top: 15px; text-align: center;"></p>
    </form>
  </div>

  <div class="footer">© 2025 联信资 版权所有</div>

  <!-- EmailJS -->
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  <script>
    (function() {
      emailjs.init("Vf3g58_uwsuIfMxCI"); // ← 你的 Public Key
    })();

    const serviceID = "service_0nbyy1m";     // ← 你的 Service ID
    const templateID = "template_la7d6sb";   // ← 你的 Template ID
    const form = document.getElementById("feedbackForm");
    const status = document.getElementById("status");
    const btn = document.getElementById("submitBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = "正在提交…";
      status.textContent = "请稍候，正在上传与发送…";

      const files = document.getElementById("evidence").files;
      const uploadedUrls = [];

      // 上传文件到 EmailJS 文件服务器
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await fetch("https://api.emailjs.com/api/v1.0/files/upload", {
              method: "POST",
              body: formData
            });

            if (!res.ok) throw new Error(`上传失败: ${res.status}`);
            const data = await res.json();
            if (data && data.url) {
              uploadedUrls.push(data.url);
              console.log("✅ 上传成功:", data.url);
            } else {
              console.warn("⚠️ 未返回 URL:", data);
            }
          } catch (err) {
            console.error("文件上传失败：", err);
            status.textContent = "⚠️ 文件上传失败，请检查网络或稍后重试。";
          }
        }
      }

      const params = {
        category: form.category.value,
        message: form.message.value,
        evidence: uploadedUrls.length ? uploadedUrls.join("\n") : "无附件"
      };

      try {
        await emailjs.send(serviceID, templateID, params);
        status.textContent = "✅ 举报已匿名提交成功！";
        form.reset();
      } catch (err) {
        console.error("发送失败：", err);
        status.textContent = "❌ 提交失败，请稍后再试。";
      } finally {
        btn.disabled = false;
        btn.textContent = "匿名提交";
      }
    });
  </script>
</body>
</html>
