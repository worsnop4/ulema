import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSharedInvitation } from '../../hooks/useSharedInvitation'
import { ToggleSwitch } from '../common/FormHelpers'

const BANK_OPTIONS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB']
const EWALLET_OPTIONS = ['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja']

export default function RekeningForm() {
  const [data, updateData] = useSharedInvitation()
  const accounts = data.accounts || []
  const giftAddress = data.giftAddress || {
    enabled: false,
    address: '',
    recipient: '',
    phone: ''
  }

  const add = () => updateData({
    accounts: [...accounts, { id: Date.now(), type: 'bank', bank: BANK_OPTIONS[0], holder: '', number: '' }]
  })
  const remove = (id) => updateData({ accounts: accounts.filter(x => x.id !== id) })
  const update = (id, key, val) => updateData({
    accounts: accounts.map(x => x.id === id ? { ...x, [key]: val } : x)
  })
  // Changing the type must also reset `bank` to a value valid for the new
  // type's option list — otherwise it keeps the old type's value (e.g. still
  // "BCA" after switching to E-Wallet), which then shows up wrong in the
  // guest-facing invitation since that raw value is what themes render.
  const updateType = (id, type) => {
    const options = type === 'bank' ? BANK_OPTIONS : EWALLET_OPTIONS
    updateData({
      accounts: accounts.map(x => x.id === id ? { ...x, type, bank: options[0] } : x)
    })
  }

  const updateGiftAddress = (key, val) => {
    updateData({
      giftAddress: {
        ...giftAddress,
        [key]: val
      }
    })
  }

  return (
    <div className="space-y-4">
      {accounts.map((acc, i) => (
        <div key={acc.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-700 text-sm">Rekening #{i + 1}</h4>
            <button onClick={() => remove(acc.id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="form-label">Tipe</label>
              <select className="form-select" value={acc.type} onChange={e => updateType(acc.id, e.target.value)}>
                <option value="bank">Bank Transfer</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">{acc.type === 'bank' ? 'Nama Bank' : 'Platform'}</label>
                <select className="form-select" value={acc.bank} onChange={e => update(acc.id, 'bank', e.target.value)}>
                  {(acc.type === 'bank' ? BANK_OPTIONS : EWALLET_OPTIONS).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Atas Nama</label>
                <input className="form-input" value={acc.holder} onChange={e => update(acc.id, 'holder', e.target.value)} placeholder="Nama pemilik" />
              </div>
            </div>
            <div>
              <label className="form-label">No. {acc.type === 'bank' ? 'Rekening' : 'HP'}</label>
              <input className="form-input font-mono" value={acc.number} onChange={e => update(acc.id, 'number', e.target.value)} placeholder="xxxx xxxx xxxx" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="btn-secondary w-full justify-center">
        <Plus size={14} /> Tambah Rekening / E-Wallet
      </button>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="font-semibold text-slate-800 text-sm">Alamat Pengiriman Kado</p>
            <p className="text-xs text-slate-500 mt-0.5">Tampilkan alamat pengiriman kado fisik untuk tamu</p>
          </div>
          <ToggleSwitch
            checked={giftAddress.enabled}
            onChange={val => updateGiftAddress('enabled', val)}
          />
        </div>
      </div>

      {giftAddress.enabled && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <div>
            <label className="form-label">Nama Penerima</label>
            <input
              className="form-input"
              value={giftAddress.recipient || ''}
              onChange={e => updateGiftAddress('recipient', e.target.value)}
              placeholder="Nama penerima paket"
            />
          </div>
          <div>
            <label className="form-label">No. HP Penerima</label>
            <input
              className="form-input"
              value={giftAddress.phone || ''}
              onChange={e => updateGiftAddress('phone', e.target.value)}
              placeholder="No. HP penerima"
            />
          </div>
          <div>
            <label className="form-label">Alamat Lengkap</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={giftAddress.address || ''}
              onChange={e => updateGiftAddress('address', e.target.value)}
              placeholder="Tuliskan alamat lengkap pengiriman kado"
            />
          </div>
        </div>
      )}
    </div>
  )
}
