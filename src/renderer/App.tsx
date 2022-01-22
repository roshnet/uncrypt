import { ContentLayout, Layout } from '@strapi/design-system/Layout'
import {
  MainNav,
  NavLink,
  NavSection,
  NavSections,
} from '@strapi/design-system/MainNav'
import { ThemeProvider } from '@strapi/design-system/ThemeProvider'
import { lightTheme } from '@strapi/design-system/themes'
import { BulletList, Key, Lock, Search } from '@strapi/icons'
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import AppHeader from './components/AppHeader'
import EncryptScreen from './pages/Encrypt'

const DrawerNav = () => (
  <MainNav condensed={false}>
    <NavSections>
      <NavSection label="Actions">
        <NavLink to="/" icon={<Lock />}>
          Encrypt
        </NavLink>
        <NavLink to="/decrypt" icon={<Key />}>
          Decrypt files
        </NavLink>
        <NavLink to="/files" icon={<BulletList />}>
          All files
        </NavLink>
        <NavLink to="/search" icon={<Search />}>
          Search
        </NavLink>
      </NavSection>
      <NavSection label="Settings">
        <NavLink to="/change-key">Change key</NavLink>
        <NavLink to="/reset">Backup and reset</NavLink>
      </NavSection>
      <NavSection label="Support">
        <NavLink to="/theory">How it works</NavLink>
        <NavLink to="/privacy">Privacy Policy</NavLink>
      </NavSection>
    </NavSections>
  </MainNav>
)

export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Router>
        <AppHeader />
        <Layout sideNav={<DrawerNav />}>
          <ContentLayout>
            <Routes>
              <Route path="/" element={<EncryptScreen />} />
            </Routes>
          </ContentLayout>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}
