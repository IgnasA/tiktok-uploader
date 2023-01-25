import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';

import { Typography, Box, TextField, Button, LinearProgress } from '@mui/material';
import { supabase } from './supabaseClient';
import Avatar from './Avatar';

const Account = ({ session }: { session: Session }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<any>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {loading ? (
        <LinearProgress color="secondary" />
      ) : (
        <form onSubmit={updateProfile}>
          <Avatar
            url={avatar_url}
            size={150}
            onUpload={(url) => {
              setAvatarUrl(url);
              updateProfile({ username, website, avatar_url: url });
            }}
          />
          <Typography>Email: {session.user.email}</Typography>
          <TextField
            label="Name"
            type="text"
            size="small"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="website"
            type="url"
            size="small"
            value={website || ''}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Box>
            <Button disabled={loading} variant="contained">
              Update profile
            </Button>
          </Box>
        </form>
      )}
      <Button onClick={() => supabase.auth.signOut()} variant="contained">
        Sign Out
      </Button>
    </Box>
  );
};

export default Account;
