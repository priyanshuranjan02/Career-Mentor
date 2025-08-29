import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Code,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "@/components/CodeEditor";

interface GestureStatus {
  attention: 'good' | 'warning' | 'poor';
  eyeContact: 'good' | 'warning' | 'poor';
  posture: 'good' | 'warning' | 'poor';
}

interface Question {
  id: number;
  text: string;
  type: 'behavioral' | 'programming';
  programmingPrompt?: string;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "Tell me about yourself and your background in software development.",
    type: 'behavioral'
  },
  {
    id: 2,
    text: "What is your experience with React and modern frontend frameworks?",
    type: 'behavioral'
  },
  {
    id: 3,
    text: "Write a function to find the two numbers in an array that add up to a target sum.",
    type: 'programming',
    programmingPrompt: `Problem: Two Sum

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
- 2 <= nums.length <= 104
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.`
  },
  {
    id: 4,
    text: "How do you handle state management in large applications?",
    type: 'behavioral'
  },
  {
    id: 5,
    text: "Implement a function to reverse a linked list.",
    type: 'programming',
    programmingPrompt: `Problem: Reverse Linked List

Given the head of a singly linked list, reverse the list, and return the reversed list.

Example:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Definition for singly-linked list:
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

Constraints:
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000`
  },
  {
    id: 6,
    text: "What are your strengths and weaknesses as a developer?",
    type: 'behavioral'
  }
];

export const Interview = () => {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [gestureStatus, setGestureStatus] = useState<GestureStatus>({
    attention: 'good',
    eyeContact: 'good',
    posture: 'good'
  });
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'code'>('video');
  const [userCode, setUserCode] = useState('');
  
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Tab focus monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isInterviewStarted) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        
        if (newCount === 1) {
          toast({
            title: "Warning",
            description: "Tab switching detected. Please stay focused on the interview.",
            variant: "destructive"
          });
        } else if (newCount === 2) {
          toast({
            title: "Final Warning",
            description: "One more tab switch will terminate the interview.",
            variant: "destructive"
          });
        } else if (newCount >= 3) {
          toast({
            title: "Interview Terminated",
            description: "Interview cancelled due to multiple tab switches.",
            variant: "destructive"
          });
          navigate("/dashboard");
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInterviewStarted, tabSwitchCount, navigate, toast]);

  // Mock gesture analysis
  useEffect(() => {
    if (!isInterviewStarted) return;

    const interval = setInterval(() => {
      // Simulate random gesture analysis results
      const statuses: Array<'good' | 'warning' | 'poor'> = ['good', 'warning', 'poor'];
      setGestureStatus({
        attention: statuses[Math.floor(Math.random() * 3)],
        eyeContact: statuses[Math.floor(Math.random() * 3)],
        posture: statuses[Math.floor(Math.random() * 3)]
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isInterviewStarted]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setCameraEnabled(true);
      setMicEnabled(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      toast({
        title: "Permissions Granted",
        description: "Camera and microphone access enabled.",
      });
    } catch (error) {
      toast({
        title: "Permission Denied",
        description: "Please allow camera and microphone access to continue.",
        variant: "destructive"
      });
    }
  };

  const startInterview = () => {
    if (!cameraEnabled || !micEnabled) {
      toast({
        title: "Permissions Required",
        description: "Please enable camera and microphone first.",
        variant: "destructive"
      });
      return;
    }
    setIsInterviewStarted(true);
    setIsRecording(true);
    toast({
      title: "Interview Started",
      description: "Good luck! Remember to maintain eye contact and stay focused.",
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setInterviewProgress(((currentQuestion + 2) / mockQuestions.length) * 100);
    } else {
      // Interview completed
      toast({
        title: "Interview Completed",
        description: "Great job! Generating your report...",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  const getGestureIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-gesture-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-gesture-warning" />;
      case 'poor': return <XCircle className="h-4 w-4 text-gesture-error" />;
      default: return <CheckCircle className="h-4 w-4 text-gesture-success" />;
    }
  };

  const getGestureColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-gesture-success';
      case 'warning': return 'text-gesture-warning';
      case 'poor': return 'text-gesture-error';
      default: return 'text-gesture-success';
    }
  };

  if (!isInterviewStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-secondary">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-4">AI Interview Setup</h1>
                <p className="text-muted-foreground mb-8">
                  Let's set up your interview environment. We'll need access to your camera and microphone
                  for gesture analysis and recording your responses.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6 mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`p-4 ${cameraEnabled ? 'bg-success/10 border-success' : 'bg-muted'}`}>
                    <div className="flex items-center space-x-3">
                      {cameraEnabled ? <Camera className="h-5 w-5 text-success" /> : <CameraOff className="h-5 w-5 text-muted-foreground" />}
                      <div className="text-left">
                        <p className="font-medium">Camera Access</p>
                        <p className="text-sm text-muted-foreground">
                          {cameraEnabled ? 'Enabled' : 'Required for gesture analysis'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className={`p-4 ${micEnabled ? 'bg-success/10 border-success' : 'bg-muted'}`}>
                    <div className="flex items-center space-x-3">
                      {micEnabled ? <Mic className="h-5 w-5 text-success" /> : <MicOff className="h-5 w-5 text-muted-foreground" />}
                      <div className="text-left">
                        <p className="font-medium">Microphone Access</p>
                        <p className="text-sm text-muted-foreground">
                          {micEnabled ? 'Enabled' : 'Required for voice responses'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {(!cameraEnabled || !micEnabled) && (
                  <Button 
                    onClick={requestPermissions}
                    className="w-full bg-gradient-primary text-primary-foreground"
                  >
                    Grant Permissions
                  </Button>
                )}

                {cameraEnabled && micEnabled && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All permissions granted! You're ready to start the interview.
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <Button 
                  onClick={startInterview}
                  disabled={!cameraEnabled || !micEnabled}
                  size="lg"
                  className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow"
                >
                  Start Interview
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant={isRecording ? "destructive" : "secondary"}>
              {isRecording ? "Recording" : "Paused"}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Tab Switches: <span className={tabSwitchCount >= 2 ? "text-destructive" : "text-muted-foreground"}>
                {tabSwitchCount}/3
              </span>
            </div>
            <Progress value={interviewProgress} className="w-32" />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="h-fit">
              <CardContent className="p-6">
                <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    className="w-full h-full object-cover"
                    mirrored
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive" className="animate-pulse">
                      ● LIVE
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Current Question:</h3>
                    {mockQuestions[currentQuestion].type === 'programming' && (
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Code className="h-3 w-3" />
                        <span>Programming</span>
                      </Badge>
                    )}
                  </div>
                  
                  {mockQuestions[currentQuestion].type === 'programming' ? (
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'video' | 'code')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="video" className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Discussion</span>
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex items-center space-x-2">
                          <Code className="h-4 w-4" />
                          <span>Code</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="video" className="mt-4">
                        <p className="text-foreground bg-muted p-4 rounded-lg">
                          {mockQuestions[currentQuestion].text}
                        </p>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            💡 <strong>Tip:</strong> First, discuss your approach verbally. Explain your thought process, then switch to the Code tab to implement your solution.
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="code" className="mt-4">
                        <div className="max-h-[600px] overflow-y-auto">
                          <CodeEditor 
                            question={mockQuestions[currentQuestion].programmingPrompt}
                            onCodeChange={setUserCode}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <p className="text-foreground bg-muted p-4 rounded-lg">
                      {mockQuestions[currentQuestion].text}
                    </p>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" disabled={currentQuestion === 0}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={nextQuestion} className="bg-gradient-primary text-primary-foreground">
                    {currentQuestion === mockQuestions.length - 1 ? 'Finish Interview' : 'Next Question'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gesture Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Gesture Analysis</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Attention Level</span>
                    <div className="flex items-center space-x-2">
                      {getGestureIcon(gestureStatus.attention)}
                      <span className={`text-sm capitalize ${getGestureColor(gestureStatus.attention)}`}>
                        {gestureStatus.attention}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eye Contact</span>
                    <div className="flex items-center space-x-2">
                      {getGestureIcon(gestureStatus.eyeContact)}
                      <span className={`text-sm capitalize ${getGestureColor(gestureStatus.eyeContact)}`}>
                        {gestureStatus.eyeContact}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Posture</span>
                    <div className="flex items-center space-x-2">
                      {getGestureIcon(gestureStatus.posture)}
                      <span className={`text-sm capitalize ${getGestureColor(gestureStatus.posture)}`}>
                        {gestureStatus.posture}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Interview Tips</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Maintain eye contact with the camera</p>
                  <p>• Sit up straight and confident</p>
                  <p>• Speak clearly and at a moderate pace</p>
                  <p>• Take your time to think before responding</p>
                  <p>• Stay focused on the interview tab</p>
                </div>
              </CardContent>
            </Card>

            {tabSwitchCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {tabSwitchCount >= 2 
                    ? "Final warning: One more tab switch will end the interview."
                    : "Warning: Tab switching detected. Please stay focused."
                  }
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Interview;