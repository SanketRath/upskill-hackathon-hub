import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle,
  FileText,
  Settings,
  AlertCircle
} from "lucide-react";
import upskillLogo from "@/assets/upskill-logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  id: string;
  title: string;
  organizer: string;
  event_date: string;
  approval_status: string;
  registered_count: number;
  total_slots: number;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: roleLoading } = useRoleCheck("admin");
  const [events, setEvents] = useState<Event[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    totalRegistrations: 0,
  });

  useEffect(() => {
    if (isAuthorized) {
      fetchDashboardData();
    }
  }, [isAuthorized]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);

      // Fetch registrations count
      const { count: regCount, error: regError } = await supabase
        .from("registrations")
        .select("*", { count: 'exact', head: true });

      if (regError) throw regError;

      // Calculate stats
      setStats({
        totalEvents: eventsData?.length || 0,
        pendingApprovals: eventsData?.filter(e => e.approval_status === 'pending').length || 0,
        totalUsers: rolesData?.length || 0,
        totalRegistrations: regCount || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ approval_status: "approved" })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event approved successfully",
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ approval_status: "rejected" })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event rejected",
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const pendingEvents = events.filter(e => e.approval_status === 'pending');
  const approvedEvents = events.filter(e => e.approval_status === 'approved');

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src={upskillLogo} alt="upSkill" className="h-10" />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Admin Panel</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approvals ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="events">All Events</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No pending approvals</p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pendingEvents.map((event) => (
                  <Card key={event.id} className="p-6">
                    <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      by {event.organizer}
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <div>Date: {new Date(event.event_date).toLocaleDateString()}</div>
                      <div>Slots: {event.total_slots}</div>
                      <div>Created: {new Date(event.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleApproveEvent(event.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleRejectEvent(event.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedEvents.map((event) => (
                <Card key={event.id} className="p-6">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    by {event.organizer}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>Status: <span className="text-green-600 font-medium">Approved</span></div>
                    <div>Registrations: {event.registered_count}/{event.total_slots}</div>
                    <div>Date: {new Date(event.event_date).toLocaleDateString()}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">User Roles</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium border-b pb-2">
                  <div>User ID</div>
                  <div>Role</div>
                  <div>Created</div>
                </div>
                {userRoles.map((userRole) => (
                  <div key={userRole.id} className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-mono text-xs">{userRole.user_id.slice(0, 8)}...</div>
                    <div className="capitalize">{userRole.role}</div>
                    <div>{new Date(userRole.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Settings className="h-6 w-6" />
                <h3 className="font-bold text-lg">System Configuration</h3>
              </div>
              <p className="text-muted-foreground">
                System configuration features coming soon...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
