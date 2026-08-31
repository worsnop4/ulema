import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { rememberReferral } from '../config/referral'

/**
 * /r/:code — tautan yang dibagikan vendor.
 *
 * Sebelumnya rute ini tidak ada sama sekali. Tautannya tertangkap catch-all
 * "*" yang mengarah ke /dashboard, dan /dashboard dijaga ProtectedRoute --
 * jadi calon klien yang mengklik tautan vendor mendarat di halaman login.
 * Bukan katalog, bukan pesan kesalahan: formulir masuk, untuk orang yang
 * belum punya akun dan cuma ingin melihat undangan. Padahal itu satu-satunya
 * tautan yang kita suruh vendor sebarkan.
 *
 * Kodenya diingat di penyimpanan browser lalu pengunjung dilempar ke katalog.
 * Ditulis di inisialisasi useState, bukan di useEffect: <Navigate> juga
 * bekerja lewat efek, dan efek anak berjalan lebih dulu daripada efek induk --
 * kodenya bisa belum tersimpan saat halaman sudah berpindah.
 */
export default function ReferralLanding() {
  const { code } = useParams()
  useState(() => rememberReferral(code))
  return <Navigate to="/#katalog" replace />
}
