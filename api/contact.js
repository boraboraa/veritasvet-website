module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    access_key,
    subject,
    from_name,
    redirect,
    inquiry_path,
    company,
    email,
    phone,
    product_interest,
    territory,
    portfolio,
    volume,
    message,
  } = req.body || {};

  if (!access_key || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const formData = new FormData();
  formData.append('access_key', access_key);
  if (subject) formData.append('subject', subject);
  if (from_name) formData.append('from_name', from_name);
  if (redirect) formData.append('redirect', redirect);
  if (inquiry_path) formData.append('inquiry_path', inquiry_path);
  if (company) formData.append('company', company);
  if (email) formData.append('email', email);
  if (phone) formData.append('phone', phone);
  if (product_interest) formData.append('product_interest', product_interest);
  if (territory) formData.append('territory', territory);
  if (portfolio) formData.append('portfolio', portfolio);
  if (volume) formData.append('volume', volume);
  if (message) formData.append('message', message);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Proxy error', error: error.message });
  }
};
