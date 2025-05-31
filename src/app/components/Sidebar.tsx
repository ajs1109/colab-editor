import React from 'react';
import  Link  from 'next/link';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Repository</h2>
      <ul>
        <li>
          <Link href="/repository/code">Code</Link>
        </li>
        <li>
          <Link href="/repository/issues">Issues</Link>
        </li>
        <li>
          <Link href="/repository/pull-requests">Pull Requests</Link>
        </li>
        <li>
          <Link href="/repository/actions">Actions</Link>
        </li>
        <li>
          <Link href="/repository/projects">Projects</Link>
        </li>
        <li>
          <Link href="/repository/wiki">Wiki</Link>
        </li>
        <li>
          <Link href="/repository/security">Security</Link>
        </li>
        <li>
          <Link href="/repository/insights">Insights</Link>
        </li>
        <li>
          <Link href="/repository/settings">Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;