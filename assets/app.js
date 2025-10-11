// EmailJS client logic
const form = document.getElementById('feedback-form');
const evidence = document.getElementById('evidence');
const fileList = document.getElementById('fileList');
const charCount = document.getElementById('charCount');
const category = document.getElementById('category');
const message = document.getElementById('message');
const confirmAnon = document.getElementById('confirmAnon');

const MAX_MB = 5;
const MAX_LEN = 1500;

function setError(key, msg) {
  const el = document.querySelector(`.error[data-for="${key}"]`);
  if (el) el.textContent = msg || '';
}

message.addEventListener('input', () => {
  const val = message.value.slice(0, MAX_LEN);
  if (val !== message.value) message.value = val;
  charCount.textContent = `${val.length}/${MAX_LEN}`;
});

evidence.addEventListener('change', () => {
  fileList.innerHTML = '';
  const arr = Array.from(evidence.files || []);
  arr.forEach(f => {
    const li = document.createElement('li');
    li.textContent = `${f.name} — ${(f.size / (1024 * 1024)).toFixed(2)}MB`;
    fileList.appendChild(li);
  });
});

function validate() {
  let ok = true;
  setError('category', '');
  setError('message', '');
  setError('evidence', '');
  setError('confirmAnon', '');

  if (!category.value) { setError('category', '请选择一个分类'); ok = false; }
  if (!message.value.trim()) { setError('message', '请填写举报/意见内容'); ok = false; }

  const arr = Array.from(evidence.files || []);
  for (const f of arr) {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError('evidence', `文件“${f.name}”超过 ${MAX_MB}MB，请压缩后上传`);
      ok = false;
      break;
    }
  }

  if (!confirmAnon.checked) { setError('confirmAnon', '请勾选确认匿名提示'); ok = false; }
  return ok;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const PUBLIC_KEY = document.getElementById('EMAILJS_PUBLIC_KEY').value.trim();
  const SERVICE_ID = document.getElementById('EMAILJS_SERVICE_ID').value.trim();
  const TEMPLATE_ID = document.getElementById('EMAILJS_TEMPLATE_ID').value.trim();

  emailjs.init(PUBLIC_KEY);

  document.querySelector('.submit').disabled = true;
  const status = document.getElementById('status');
  status.textContent = '正在上传文件，请稍候…';

  const files = Array.from(evidence.files || []);
  let uploadedUrls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://api.emailjs.com/api/v1/files/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data && data.url) uploadedUrls.push(data.url);
    } catch (err) {
      console.error("上传失败：", err);
    }
  }

  const params = {
    category: category.value,
    message: message.value,
    evidence: uploadedUrls.length ? uploadedUrls.join("\n") : "无附件"
  };

  status.textContent = '正在发送邮件，请稍候…';

  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
    if (res.status === 200) {
      status.textContent = "✅ 举报已匿名提交成功！";
      form.reset();
      fileList.innerHTML = '';
      charCount.textContent = '0/1500';
    } else {
      status.textContent = "❌ 提交失败：" + res.text;
    }
  } catch (err) {
    console.error(err);
    status.textContent = "❌ 网络异常，请稍后重试。";
  } finally {
    document.querySelector('.submit').disabled = false;
  }
});

