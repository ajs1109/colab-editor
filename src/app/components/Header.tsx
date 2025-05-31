import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <Link href="/">GitHub Clone</Link>
      </div>
      <nav className="navigation">
        <ul>
          <li>
            <Link href="/repository">Repository</Link>
          </li>
          <li>
            <Link href="/issues">Issues</Link>
          </li>
          <li>
            <Link href="/pull-requests">Pull Requests</Link>
          </li>
          <li>
            <Link href="/projects">Projects</Link>
          </li>
          <li>
            <Link href="/wiki">Wiki</Link>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <div className="user-info">
        <Link href="/profile">Profile</Link>
        <Link href="/logout">Logout</Link>
      </div>
    </header>
  );
};

export default Header;