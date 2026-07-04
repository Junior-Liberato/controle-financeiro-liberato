function ensurePaymentFields() {
  const form = document.querySelector('#new-account-form');

  if (!form || form.dataset.paymentFlowReady === 'true') return;

  const dueDateField = document.querySelector('#account-due-date')?.closest('.field-label');

  if (!dueDateField) return;

  dueDateField.insertAdjacentHTML('beforebegin', `
    <label class="field-label payment-flow-field">
      Data do lançamento
      <input class="input" id="account-launch-date" type="date" required>
    </label>

    <label class="field-label payment-flow-field">
      Forma de pagamento
      <select class="input" id="account-payment-method" required>
        <option value="pix">PIX</option>
        <option value="debit">Débito</option>
        <option value="cash">Dinheiro</option>
        <option value="credit-card">Cartão de crédito</option>
      </select>
    </label>
  `);

  const today = new Date().toISOString().slice(0, 10);
  const launchDateInput = document.querySelector('#account-launch-date');
  const dueDateInput = document.querySelector('#account-due-date');
  const paymentMethodInput = document.querySelector('#account-payment-method');

  launchDateInput.value = dueDateInput?.value || today;

  paymentMethodInput.addEventListener('change', () => {
    const isCreditCard = paymentMethodInput.value === 'credit-card';

    if (isCreditCard) {
      dueDateField.classList.add('soft-hidden-field');
      dueDateInput.required = false;
      dueDateInput.value = launchDateInput.value;
    } else {
      dueDateField.classList.remove('soft-hidden-field');
      dueDateInput.required = true;
      dueDateInput.value = launchDateInput.value;
    }
  });

  launchDateInput.addEventListener('change', () => {
    if (!dueDateInput.value || paymentMethodInput.value === 'credit-card') {
      dueDateInput.value = launchDateInput.value;
    }
  });

  form.dataset.paymentFlowReady = 'true';
}

function hideLegacyPayButtons() {
  document.querySelectorAll('.pay-account-btn').forEach((button) => {
    button.remove();
  });
}

function ensurePaymentFlowStyles() {
  if (document.querySelector('#payment-flow-css')) return;

  const style = document.createElement('style');
  style.id = 'payment-flow-css';
  style.textContent = `
    .soft-hidden-field {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

export function setupPaymentFlow() {
  ensurePaymentFlowStyles();
  ensurePaymentFields();
  hideLegacyPayButtons();

  const observer = new MutationObserver(() => {
    ensurePaymentFields();
    hideLegacyPayButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
