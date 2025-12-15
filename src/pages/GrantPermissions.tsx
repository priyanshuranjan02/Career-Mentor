import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  Monitor, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const GrantPermissions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    screenShare: false,
  });
  
  const [isStarting, setIsStarting] = useState(false);

  // Get resume data from previous step
  const resumeData = location.state;

  const requestPermission = async (type: 'camera' | 'microphone' | 'screenShare') => {
    try {
      let stream: MediaStream | null = null;
      
      switch (type) {
        case 'camera':
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissions(prev => ({ ...prev, camera: true }));
          toast({
            title: "Camera Access Granted",
            description: "Camera permission has been successfully granted.",
          });
          break;
          
        case 'microphone':
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissions(prev => ({ ...prev, microphone: true }));
          toast({
            title: "Microphone Access Granted",
            description: "Microphone permission has been successfully granted.",
          });
          break;
          
        case 'screenShare':
        //   @ts-ignore - getDisplayMedia might not be in all TypeScript definitions
          stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setPermissions(prev => ({ ...prev, screenShare: true }));
          toast({
            title: "Screen Share Access Granted",
            description: "Screen sharing permission has been successfully granted.",
          });
          break;
      }
      
      // Stop the stream immediately after getting permission
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      toast({
        title: "Permission Denied",
        description: `Failed to get ${type} permission. Please allow access and try again.`,
        variant: "destructive"
      });
    }
  };

  const allPermissionsGranted = permissions.camera && permissions.microphone && permissions.screenShare;

  const handleStartInterview = () => {
    if (!allPermissionsGranted) {
      toast({
        title: "Permissions Required",
        description: "Please grant all permissions to start the interview.",
        variant: "destructive"
      });
      return;
    }

    setIsStarting(true);
    
    // Store permissions and resume data for interview
    localStorage.setItem('interviewPermissions', JSON.stringify(permissions));
    
    setTimeout(() => {
      navigate('/interview');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Grant Permissions
          </h1>
          <p className="text-muted-foreground text-lg">
            We need access to your camera and microphone to conduct the AI interview
          </p>
        </motion.div>

        {/* Resume Status */}
        {resumeData?.resumeUploaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 text-success">
                  <CheckCircle className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Resume Successfully Uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      File: {resumeData.fileName} ({(resumeData.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Camera Permission */}
                <div className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${permissions.camera ? 'bg-success/10' : 'bg-muted'}`}>
                      <Camera className={`h-6 w-6 ${permissions.camera ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Camera Access</h3>
                      <p className="text-sm text-muted-foreground">
                        Required to see your facial expressions and body language during the interview
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permissions.camera ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Button
                        onClick={() => requestPermission('camera')}
                        variant="outline"
                        size="sm"
                      >
                        Grant Access
                      </Button>
                    )}
                  </div>
                </div>

                {/* Microphone Permission */}
                <div className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${permissions.microphone ? 'bg-success/10' : 'bg-muted'}`}>
                      <Mic className={`h-6 w-6 ${permissions.microphone ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Microphone Access</h3>
                      <p className="text-sm text-muted-foreground">
                        Required to record your voice responses during the interview
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permissions.microphone ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Button
                        onClick={() => requestPermission('microphone')}
                        variant="outline"
                        size="sm"
                      >
                        Grant Access
                      </Button>
                    )}
                  </div>
                </div>

                {/* Screen Share Permission */}
                <div className="flex items-center justify-between p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${permissions.screenShare ? 'bg-success/10' : 'bg-muted'}`}>
                      <Monitor className={`h-6 w-6 ${permissions.screenShare ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Screen Share Access</h3>
                      <p className="text-sm text-muted-foreground">
                        Optional: For technical interviews where you need to share your screen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permissions.screenShare ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Button
                        onClick={() => requestPermission('screenShare')}
                        variant="outline"
                        size="sm"
                      >
                        Grant Access
                      </Button>
                    )}
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-primary mb-2">Privacy & Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Your interview data is encrypted and secure. We only record during the interview session 
                        and never access your device outside of the interview time. You can revoke these 
                        permissions at any time through your browser settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {!allPermissionsGranted && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <p className="text-warning font-medium">
                        Please grant camera and microphone access to proceed with the interview
                      </p>
                    </div>
                  </div>
                )}

                {allPermissionsGranted && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <p className="text-success font-medium">
                        All permissions granted! You're ready to start the interview.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => navigate('/resume-upload')}
                  disabled={isStarting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Resume
                </Button>

                <Button
                  onClick={handleStartInterview}
                  disabled={!allPermissionsGranted || isStarting}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isStarting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Starting Interview...</span>
                    </div>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flow Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <span className="text-success">✓ 1. Start Interview</span>
            <span>→</span>
            <span className="text-success">✓ 2. Upload Resume</span>
            <span>→</span>
            <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
              3. Grant Permissions
            </span>
            <span>→</span>
            <span>4. Interview Begins</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GrantPermissions;
