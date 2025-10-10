// EmailJS client
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
    li.textContent = `${f.name} — ${(f.size / (1024*1024)).toFixed(2)}MB`;
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
      setError('evidence', `文件“${f.name}”超过 ${MAX_MB}MB，建议先压缩后再上传`);
      ok = false; break;
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

  if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
    alert('尚未配置 EmailJS 的 Public Key / Service ID / Template ID。请先在 index.html 顶部隐藏字段中填入你的值。');
    return;
  }

  // Init EmailJS
  emailjs.init(PUBLIC_KEY);

  // Inject subject
  const subject = `联信资匿名意见箱 - ${category.value || '未分类'}`;
  const subjectInput = document.createElement('input');
  subjectInput.type = 'hidden';
  subjectInput.name = 'subject';
  subjectInput.value = subject;
  form.appendChild(subjectInput);

  try {
    const res = await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
    if (res.status === 200) {
      window.location.href = 'thanks.html';
    } else {
      alert('提交失败：' + (res.text || '未知错误'));
    }
  } catch (err) {
    console.error(err);
    alert('网络异常或服务不可用，请稍后再试。');
  } finally {
    form.removeChild(subjectInput);
  }
});
