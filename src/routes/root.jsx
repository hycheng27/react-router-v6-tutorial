import { Form, NavLink, Outlet } from 'react-router-dom';

export default function Root() {
  const tools = [{ url: 'vb-model', name: 'VB Model' }];

  return (
    <>
      <div id="sidebar">
        <h1>My VB Tools</h1>
        <nav>
          <ul>
            {tools.length ? (
              tools.map((tool, i) => (
                <li key={`tool-${i}`}>
                  <NavLink
                    to={`tools/${tool.url}`}
                    className={({ isActive, isPending }) => (isActive ? 'active' : isPending ? 'pending' : '')}
                  >
                    {tool.name}
                  </NavLink>
                </li>
              ))
            ) : (
              <p>
                <i>No tools</i>
              </p>
            )}
          </ul>
        </nav>
      </div>
      <div id="detail" style={{ overflow: 'auto' }}>
        <Outlet />
      </div>
    </>
  );
}
