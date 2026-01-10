import { useState, useEffect } from 'react';
import { Store, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { sendOTP, verifyOTP } from '../../services/auth';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // We don't need real confirmation results in mock mode
  const [mockSession, setMockSession] = useState<any>(null);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) return;

    setIsLoading(true);
    try {
      const session = await sendOTP(phoneNumber);
      setMockSession(session);
      setStep('otp');
      setTimer(30);
      toast.success('OTP sent! (Use 123456)', { duration: 4000 });
    } catch (error) {
      toast.error('Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      const isValid = await verifyOTP(mockSession, otp);

      if (isValid) {
        toast.success('Login Successful!');
        onLogin();
      } else {
        toast.error('Invalid OTP. Use 123456');
        setOtp('');
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setIsLoading(true);
    try {
      await sendOTP(phoneNumber);
      setTimer(30);
      toast.success('OTP resent! (Use 123456)');
    } catch (error) {
      toast.error('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200/50">
          <Store className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900 tracking-tight">VypaarSaathi</h1>
        <p className="text-gray-600 text-lg">Your Smart Business Companion</p>
      </motion.div>

      <motion.div
        layout
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">Welcome Back!</h2>
                <p className="text-gray-500">Enter your mobile number to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Mobile Number</label>
                  <div className="flex gap-3 group">
                    <div className="w-16 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-medium group-focus-within:border-blue-500 group-focus-within:bg-blue-50 transition-colors">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 h-12 text-lg rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-all font-medium tracking-wide"
                      maxLength={10}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={phoneNumber.length !== 10 || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-lg font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400">
                Data secured with 256-bit encryption
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">Verify OTP</h2>
                <p className="text-gray-500">
                  Enter the 6-digit code sent properly to <br />
                  <span className="text-blue-600 font-medium">+91 {phoneNumber}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    autoComplete="one-time-code"
                    onComplete={() => setTimeout(handleVerifyOTP, 0)}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-xl border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-lg font-medium shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <CheckCircle2 className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={() => setStep('phone')}
                      className="text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      Wrong Number?
                    </button>
                    {timer > 0 ? (
                      <span className="text-gray-400 font-mono">Resend in {timer}s</span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Features Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid grid-cols-3 gap-4 max-w-md w-full text-center"
      >
        <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 transition-colors cursor-default">
          <div className="text-2xl mb-1">📦</div>
          <div className="text-xs font-medium text-gray-700">Inventory</div>
        </div>
        <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 transition-colors cursor-default">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xs font-medium text-gray-700">Insights</div>
        </div>
        <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl hover:bg-white/60 transition-colors cursor-default">
          <div className="text-2xl mb-1">📱</div>
          <div className="text-xs font-medium text-gray-700">Connect</div>
        </div>
      </motion.div>
    </div>
  );
}