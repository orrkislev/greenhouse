'use client'

import { useState } from 'react';
import { useUser } from '@/utils/store/user';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function NewStudentPage() {
  const { signUp, loading, error } = useUser();
  const [pin, setPin] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    className: '',
    username: '',
  });
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
    setSuccess(false);
  };

  const validate = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Full name is required';
    if (!form.className.trim()) return 'Class is required';
    if (!form.username.trim()) return 'Username is required';
    if (!/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    try {
      await signUp(form.username, pin, form);
      setSuccess(true);
      setForm({ firstName: '', lastName: '', className: '', username: '', pin: '' });
    } catch (e) {
      // error is handled by store, but we can show a generic fallback
      setFormError('Failed to sign up.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Student Sign Up</CardTitle>
          <CardDescription className="text-center">
            Fill in the details to create a new student account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{formError}</div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">Account created!</div>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} autoComplete="given-name" />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} autoComplete="family-name" />
              </div>
            </div>
            <div>
              <label htmlFor="className" className="text-sm font-medium">Class</label>
              <Input id="className" name="className" value={form.className} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input id="username" name="username" value={form.username} onChange={handleChange} autoComplete="username" />
            </div>
            <div>
              <label htmlFor="pin" className="text-sm font-medium">4-Digit PIN</label>
              <Input id="pin" name="pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} autoComplete="new-password" inputMode="numeric" pattern="\d{4}" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}